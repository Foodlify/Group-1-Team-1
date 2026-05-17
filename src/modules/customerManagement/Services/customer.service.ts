import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CustomerRepository } from '../Repositories/customer.repository';
import {
  EmailAlreadyRegistered,
  PhoneAlreadyRegistered,
  InvalidCredentials,
  InvalidToken,
  CustomerNotFound,
  PasswordMismatch,
} from '../customer.execption';
import { CustomerMailService } from '../customer.mail';
import {
  RegisterInput,
  RegisterResponse,
  LoginInput,
  LoginResponse,
  RefreshTokenInput,
  RefreshTokenResponse,
  LogoutResponse,
  ForgotPasswordInput,
  ForgotPasswordResponse,
  ResetPasswordFromLinkInput,
  ResetPasswordFromLinkResponse,
  ChangePasswordInput,
  ChangePasswordResponse,
} from '../customer.model';
import loggerService from '../../../shared_infrastructure/logger/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'superrefreshsecret';

export class CustomerService {
  static async register(data: RegisterInput): Promise<RegisterResponse> {
    const { name, email, password, phone, dob, gender } = data;
    loggerService.info('Customer registration attempt', { email });

    const existingUser = await CustomerRepository.findUserByEmail(email);
    if (existingUser) {
      loggerService.warn('Registration failed: email already registered', { email });
      throw new EmailAlreadyRegistered();
    }

    const existingCustomer =
      await CustomerRepository.findCustomerByPhone(phone);
    if (existingCustomer) {
      loggerService.warn('Registration failed: phone already registered', { phone });
      throw new PhoneAlreadyRegistered();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await CustomerRepository.createUserWithCustomer(
      { name, email, password: hashedPassword },
      {
        phone,
        dob: dob ? new Date(`${dob.substring(0, 10)}T00:00:00.000Z`) : null,
        gender,
      },
    );

    loggerService.info('Customer registered successfully', { userId: user.id, customerId: user.customer?.id, email });

    return {
      user: {
        id: user.id,
        customerId: user.customer?.id,
        name: user.name,
        email: user.email,
        phone: user.customer?.phone,
      },
    };
  }

  static async login(data: LoginInput): Promise<LoginResponse> {
    const { email, password } = data;
    loggerService.info('Customer login attempt', { email });

    const user = await CustomerRepository.findUserByEmail(email);

    if (!user || !user.customer) {
      loggerService.warn('Login failed: user not found or not a customer', { email });
      throw new InvalidCredentials();
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      loggerService.warn('Login failed: invalid password', { email });
      throw new InvalidCredentials();
    }

    const accessToken = jwt.sign(
      { userId: user.id, customerId: user.customer.id },
      JWT_SECRET,
      { expiresIn: '2d' },
    );  

    const refreshToken = jwt.sign(
      { userId: user.id, customerId: user.customer.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '4d' },
    );

    await CustomerRepository.updateUserRefreshToken(user.id, refreshToken);
    loggerService.info('Customer logged in successfully', { userId: user.id, customerId: user.customer.id });

    return {
      accessToken,
      refreshToken,
    };
  }

  static async refreshToken(
    data: RefreshTokenInput,
  ): Promise<RefreshTokenResponse> {
    const { refreshToken } = data;
    loggerService.info('Token refresh attempt');

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (error) {
      // Refresh token expired — find user by token and clear it from DB to force logout
      try {
        const expiredDecoded = jwt.decode(refreshToken) as any;
        if (expiredDecoded?.userId) {
          const user = await CustomerRepository.findUserById(expiredDecoded.userId);
          if (user?.refreshToken === refreshToken) {
            await CustomerRepository.updateUserRefreshToken(expiredDecoded.userId, null);
            loggerService.info('Refresh token expired: cleared from DB, user logged out', { userId: expiredDecoded.userId });
          }
        }
      } catch {}
      loggerService.warn('Token refresh failed: refresh token expired or invalid');
      throw new InvalidToken();
    }

    const user = await CustomerRepository.findUserById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken || !user.customer) {
      loggerService.warn('Token refresh failed: invalid or mismatched token', { userId: decoded.userId });
      throw new InvalidToken();
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, customerId: user.customer.id },
      JWT_SECRET,
      { expiresIn: '2d' },
    );

    loggerService.info('Token refreshed successfully', { userId: user.id, customerId: user.customer.id });
    return { accessToken: newAccessToken };
  }

  static async logout(customerId: number): Promise<LogoutResponse> {
    loggerService.info('Customer logout attempt', { customerId });

    const customer = await CustomerRepository.findCustomerById(customerId);
    if (!customer) {
      loggerService.warn('Logout failed: customer not found', { customerId });
      throw new CustomerNotFound();
    }

    await CustomerRepository.updateUserRefreshToken(customer.userId, null);
    loggerService.info('Customer logged out successfully', { customerId, userId: customer.userId });

    return {};
  }

  static async forgotPassword(
    data: ForgotPasswordInput,
  ): Promise<ForgotPasswordResponse> {
    const { email } = data;
    loggerService.info('Forgot password request', { email });

    const user = await CustomerRepository.findUserByEmail(email);
    if (!user) {
      loggerService.info('Forgot password: email not found, returning success to prevent enumeration', { email });
      return {};
    }

    const resetToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: '1h',
    });

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password.html?token=${resetToken}`;

    try {
      await CustomerMailService.sendResetPasswordEmail(email, resetLink);
      loggerService.info('Password reset email sent', { email, userId: user.id });
    } catch (error) {
      loggerService.warn('SMTP failed for password reset email', { email, resetLink });
    }

    return {};
  }

  static async resetPasswordFromLink(
    data: ResetPasswordFromLinkInput,
  ): Promise<ResetPasswordFromLinkResponse> {
    const { token, newPassword } = data;
    loggerService.info('Password reset from link attempt');

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await CustomerRepository.updateUserPassword(
        decoded.userId,
        hashedPassword,
      );

      loggerService.info('Password reset from link successful', { userId: decoded.userId });
      return {};
    } catch (error) {
      loggerService.warn('Password reset from link failed: invalid or expired token');
      throw new InvalidToken();
    }
  }

  static async revokeRefreshToken(customerId: number): Promise<LogoutResponse> {
    loggerService.info('Revoke refresh token attempt', { customerId });

    const customer = await CustomerRepository.findCustomerById(customerId);
    if (!customer) {
      loggerService.warn('Revoke refresh token failed: customer not found', { customerId });
      throw new CustomerNotFound();
    }

    await CustomerRepository.updateUserRefreshToken(customer.userId, null);
    loggerService.info('Refresh token revoked successfully', { customerId, userId: customer.userId });

    return {};
  }

  static async changePassword(
    userId: number,
    data: ChangePasswordInput,
  ): Promise<ChangePasswordResponse> {
    const { oldPassword, newPassword } = data;
    loggerService.info('Change password attempt', { userId });

    const user = await CustomerRepository.findUserById(userId);
    if (!user) {
      loggerService.warn('Change password failed: user not found', { userId });
      throw new CustomerNotFound();
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      loggerService.warn('Change password failed: old password mismatch', { userId });
      throw new PasswordMismatch('Invalid old password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await CustomerRepository.updateUserPassword(user.id, hashedPassword);
    loggerService.info('Password changed successfully', { userId });

    return {};
  }
}
