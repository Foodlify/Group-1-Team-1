import { UserManagementRepository } from '../repositories/userManagement.repository';
import { InvalidCredentials, InvalidToken, PasswordMismatch } from '../user.exception';
import {
  AccessTokenPayload,
  signAccess,
  signRefresh,
  signResetToken,
  verifyRefresh,
  verifyResetToken,
} from '../../../shared_infrastructure/auth/jwt.helper';
import { hashPassword, comparePassword } from '../../../shared_infrastructure/auth/password.helper';
import loggerService from '../../../shared_infrastructure/logger/logger';
import { MailService } from '../../../utils/mailService';

type LoginUserRecord   = NonNullable<Awaited<ReturnType<typeof UserManagementRepository.findUserByEmail>>>;
type RefreshUserRecord = NonNullable<Awaited<ReturnType<typeof UserManagementRepository.findUserById>>>;

export class SharedAuthService {
  /**
   * Shared login core: fetch user, run caller's type-check + payload builder, verify password, issue tokens.
   * resolvePayload validates the user type for the calling context and returns the JWT payload.
   */
  static async login(
    email: string,
    password: string,
    resolvePayload: (user: LoginUserRecord) => AccessTokenPayload | Promise<AccessTokenPayload>,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await UserManagementRepository.findUserByEmail(email);
    if (!user) throw new InvalidCredentials();

    const isValid = await comparePassword(password, user.password);
    if (!isValid) throw new InvalidCredentials();

    const payload = await resolvePayload(user);
    return SharedAuthService.issueTokens(user.id, payload);
  }

  /**
   * Shared refresh token core: verify token, clean up if expired, fetch user,
   * validate token match, then let caller validate type and build new JWT payload.
   */
  static async refreshToken(
    token: string,
    resolvePayload: (user: RefreshUserRecord) => AccessTokenPayload | Promise<AccessTokenPayload>,
  ): Promise<{ accessToken: string }> {
    let decoded: { userId: number };
    try {
      decoded = verifyRefresh(token);
    } catch {
      await UserManagementRepository.cleanupExpiredRefreshToken(token);
      throw new InvalidToken();
    }

    const user = await UserManagementRepository.findUserById(decoded.userId);
    if (!user || user.refreshToken !== token) throw new InvalidToken();

    const payload = await resolvePayload(user);
    return { accessToken: signAccess(payload) };
  }

  /**
   * Shared forgot password core: find user, validate type, build reset link, send email.
   * validate returns false → silent return (prevent enumeration).
   * sendEmail differs per user type (template + URL path).
   */
  static async forgotPassword(
    email: string,
    validate: (user: LoginUserRecord) => boolean,
    resetPath: string,
    emailOptions: { subject: string; html: (link: string) => string },
  ): Promise<void> {
    const user = await UserManagementRepository.findUserByEmail(email);
    if (!user || !validate(user)) return;

    const resetLink = SharedAuthService.buildResetLink(user.id, resetPath);
    try {
      await MailService.sendMail({ to: email, subject: emailOptions.subject, html: emailOptions.html(resetLink) });
      loggerService.info('Password reset email sent', { email, userId: user.id });
    } catch {
      loggerService.warn('SMTP failed for password reset email', { email });
    }
  }

  /**
   * Clears stored refresh token for a userId.
   * Caller passes the domain-specific not-found error.
   */
  static async clearRefreshToken(userId: number, notFoundError: Error): Promise<void> {
    const user = await UserManagementRepository.findUserById(userId);
    if (!user) throw notFoundError;
    await UserManagementRepository.updateRefreshToken(userId, null);
  }

  /**
   * Signs access + refresh tokens, stores refresh token in DB.
   */
  static async issueTokens(
    userId: number,
    payload: AccessTokenPayload,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken  = signAccess(payload);
    const refreshToken = signRefresh({ userId });
    await UserManagementRepository.updateRefreshToken(userId, refreshToken);
    return { accessToken, refreshToken };
  }

  /**
   * Builds a signed reset link. resetPath differs per user type.
   */
  static buildResetLink(userId: number, resetPath: string): string {
    const token   = signResetToken({ userId });
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return `${baseUrl}${resetPath}?token=${token}`;
  }

  /**
   * Verifies reset token, hashes new password, persists it.
   */
  static async resetPasswordFromLink(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = verifyResetToken(token);
      const hashed  = await hashPassword(newPassword);
      await UserManagementRepository.updatePassword(decoded.userId, hashed);
      loggerService.info('Password reset from link successful', { userId: decoded.userId });
    } catch {
      loggerService.warn('Password reset from link failed: invalid or expired token');
      throw new InvalidToken();
    }
  }

  /**
   * Verifies old password, hashes and persists new one.
   * Caller passes the domain-specific not-found error.
   */
  static async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
    notFoundError: Error,
  ): Promise<void> {
    loggerService.info('Change password attempt', { userId });

    const user = await UserManagementRepository.findUserById(userId);
    if (!user) {
      loggerService.warn('Change password failed: user not found', { userId });
      throw notFoundError;
    }

    const isValid = await comparePassword(oldPassword, user.password);
    if (!isValid) {
      loggerService.warn('Change password failed: old password mismatch', { userId });
      throw new PasswordMismatch();
    }

    const hashed = await hashPassword(newPassword);
    await UserManagementRepository.updatePassword(userId, hashed);
    loggerService.info('Password changed successfully', { userId });
  }

  static async updateEmail(
    userId: number,
    currentPassword: string,
    newEmail: string,
    notFoundError: Error,
    emailTakenError: Error,
  ): Promise<{ email: string }> {
    const user = await UserManagementRepository.findUserById(userId);
    if (!user) throw notFoundError;

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) throw new InvalidCredentials();

    if (newEmail !== user.email) {
      const taken = await UserManagementRepository.findUserByEmail(newEmail);
      if (taken) throw emailTakenError;
    }

    await UserManagementRepository.updateUser(userId, { email: newEmail });
    return { email: newEmail };
  }
}
