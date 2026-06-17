import prisma from '../../../../lib/prisma';
import { CustomerRepository } from '../Repositories/customer.repository';
import { UserManagementRepository } from '../../userManagement/repositories/userManagement.repository';
import { SharedAuthService } from '../../userManagement/services/shared-auth.service';
import {
  EmailAlreadyRegistered,
  PhoneAlreadyRegistered,
  InvalidCredentials,
  InvalidToken,
  CustomerNotFound,
} from '../customer.exception';
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
import { USER_TYPE } from '../../../shared_infrastructure/auth/user-type.constants';
import { hashPassword } from '../../../shared_infrastructure/auth/password.helper';

export class CustomerService {
  static async register(data: RegisterInput): Promise<RegisterResponse> {
    const { name, email, password, phone, dob, gender } = data;
    loggerService.info('Customer registration attempt', { email });

    const existingUser = await UserManagementRepository.findUserByEmail(email);
    if (existingUser) {
      loggerService.warn('Registration failed: email already registered', { email });
      throw new EmailAlreadyRegistered();
    }

    const existingCustomer = await CustomerRepository.findCustomerByPhone(phone);
    if (existingCustomer) {
      loggerService.warn('Registration failed: phone already registered', { phone });
      throw new PhoneAlreadyRegistered();
    }

    const hashedPassword = await hashPassword(password);

    const [user, customer] = await prisma.$transaction(async (tx) => {
      const user = await UserManagementRepository.createUser(
        { name, email, password: hashedPassword, userTypeCode: USER_TYPE.CUSTOMER },
        tx,
      );
      const customer = await CustomerRepository.createCustomer(
        user.id,
        {
          phone,
          dob: dob ? new Date(`${dob.substring(0, 10)}T00:00:00.000Z`) : null,
          gender,
        },
        tx,
      );
      return [user, customer] as const;
    });

    loggerService.info('Customer registered successfully', { userId: user.id, customerId: customer.id, email });

    return {
      user: {
        id:         user.id,
        customerId: customer.id,
        name:       user.name,
        email:      user.email,
        phone:      customer.phone,
      },
    };
  }

  static async login(data: LoginInput): Promise<LoginResponse> {
    loggerService.info('Customer login attempt', { email: data.email });

    const tokens = await SharedAuthService.login(data.email, data.password, async (user) => {
      const customer = await CustomerRepository.findCustomerByUserId(user.id);
      if (!customer) throw new InvalidCredentials();
      return { customerId: customer.id };
    });

    loggerService.info('Customer logged in successfully');
    return tokens;
  }

  static async refreshToken(data: RefreshTokenInput): Promise<RefreshTokenResponse> {
    loggerService.info('Token refresh attempt');

    const result = await SharedAuthService.refreshToken(data.refreshToken, async (user) => {
      const customer = await CustomerRepository.findCustomerByUserId(user.id);
      if (!customer) throw new InvalidToken();
      return { customerId: customer.id };
    });

    loggerService.info('Token refreshed successfully');
    return result;
  }

  static async logout(userId: number): Promise<LogoutResponse> {
    loggerService.info('Customer logout', { userId });
    await SharedAuthService.clearRefreshToken(userId, new CustomerNotFound());
    return {};
  }

  static async forgotPassword(data: ForgotPasswordInput): Promise<ForgotPasswordResponse> {
    loggerService.info('Forgot password request', { email: data.email });

    await SharedAuthService.forgotPassword(
      data.email,
      (user) => user.userTypeCode === USER_TYPE.CUSTOMER,
      '/reset-password.html',
      (email, link) => CustomerMailService.sendResetPasswordEmail(email, link),
    );

    return {};
  }

  static async resetPasswordFromLink(data: ResetPasswordFromLinkInput): Promise<ResetPasswordFromLinkResponse> {
    await SharedAuthService.resetPasswordFromLink(data.token, data.newPassword);
    return {};
  }

  static async changePassword(userId: number, data: ChangePasswordInput): Promise<ChangePasswordResponse> {
    await SharedAuthService.changePassword(userId, data.oldPassword, data.newPassword, new CustomerNotFound());
    return {};
  }
}
