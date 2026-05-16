import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CustomerRepository } from '../customer.repository';
import { 
  EmailAlreadyRegistered, 
  PhoneAlreadyRegistered, 
  InvalidCredentials, 
  InvalidToken, 
  CustomerNotFound, 
  PasswordMismatch 
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

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'superrefreshsecret';

export class CustomerService {
  static async register(data: RegisterInput): Promise<RegisterResponse> {
    const { name, email, password, phone, dob, gender } = data;

    // Check if email or phone already exists
    const existingUser = await CustomerRepository.findUserByEmail(email);
    if (existingUser) {
      throw new EmailAlreadyRegistered();
    }

    const existingCustomer = await CustomerRepository.findCustomerByPhone(phone);
    if (existingCustomer) {
      throw new PhoneAlreadyRegistered();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await CustomerRepository.createUserWithCustomer(
      { name, email, password: hashedPassword },
      { phone, dob: dob ? new Date(`${dob.substring(0, 10)}T00:00:00.000Z`) : null, gender }
    );

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

    const user = await CustomerRepository.findUserByEmail(email);

    if (!user || !user.customer) {
      throw new InvalidCredentials();
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new InvalidCredentials();
    }

    const accessToken = jwt.sign(
      { userId: user.id, customerId: user.customer.id },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, customerId: user.customer.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Save refresh token to user
    await CustomerRepository.updateUserRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  static async refreshToken(data: RefreshTokenInput): Promise<RefreshTokenResponse> {
    const { refreshToken } = data;

    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;

      const user = await CustomerRepository.findUserById(decoded.userId);

      if (!user || user.refreshToken !== refreshToken || !user.customer) {
        throw new InvalidToken();
      }

      const newAccessToken = jwt.sign(
        { userId: user.id, customerId: user.customer.id },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new InvalidToken();
    }
  }

  static async logout(customerId: number): Promise<LogoutResponse> {
    const customer = await CustomerRepository.findCustomerById(customerId);
    if (!customer) {
      throw new CustomerNotFound();
    }

    await CustomerRepository.updateUserRefreshToken(customer.userId, null);

    return {};
  }

  static async forgotPassword(data: ForgotPasswordInput): Promise<ForgotPasswordResponse> {
    const { email } = data;

    const user = await CustomerRepository.findUserByEmail(email);
    if (!user) {
      // Return success even if not found to prevent email enumeration
      return {};
    }

    // Generate a temporary reset token (one-time link token)
    const resetToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    // Construct the reset link
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password.html?token=${resetToken}`;

    // Send the actual email
    try {
      await CustomerMailService.sendResetPasswordEmail(email, resetLink);
    } catch (error) {
      console.warn(`\n[ForgotPassword] SMTP sending failed, logging reset link here:\n👉 ${resetLink}\n`);
    }

    return {};
  }

  static async resetPasswordFromLink(data: ResetPasswordFromLinkInput): Promise<ResetPasswordFromLinkResponse> {
    const { token, newPassword } = data;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await CustomerRepository.updateUserPassword(decoded.userId, hashedPassword);

      return {};
    } catch (error) {
      throw new InvalidToken();
    }
  }

  static async changePassword(userId: number, data: ChangePasswordInput): Promise<ChangePasswordResponse> {
    const { oldPassword, newPassword } = data;

    const user = await CustomerRepository.findUserById(userId);
    if (!user) {
      throw new CustomerNotFound();
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new PasswordMismatch('Invalid old password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await CustomerRepository.updateUserPassword(user.id, hashedPassword);

    return {};
  }
}
