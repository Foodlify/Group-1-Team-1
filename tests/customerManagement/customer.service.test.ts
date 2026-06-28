import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../../src/modules/customerManagement/Repositories/customer.repository');
jest.mock('../../src/modules/userManagement/repositories/userManagement.repository');
jest.mock('../../src/modules/userManagement/services/shared-auth.service');
jest.mock('../../src/shared_infrastructure/auth/password.helper');
jest.mock('../../src/shared_infrastructure/logger/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: { $transaction: jest.fn() },
}));

import { CustomerService } from '../../src/modules/customerManagement/Services/customer.service';
import { CustomerRepository } from '../../src/modules/customerManagement/Repositories/customer.repository';
import { UserManagementRepository } from '../../src/modules/userManagement/repositories/userManagement.repository';
import { SharedAuthService } from '../../src/modules/userManagement/services/shared-auth.service';
import { hashPassword } from '../../src/shared_infrastructure/auth/password.helper';
import prisma from '../../lib/prisma';
import {
  EmailAlreadyRegistered,
  PhoneAlreadyRegistered,
  InvalidCredentials,
  InvalidToken,
  CustomerNotFound,
  PasswordMismatch,
} from '../../src/modules/customerManagement/customer.exception';

// ── Typed mocks ───────────────────────────────────────────────────────────────

const mockCustomerRepository    = jest.mocked(CustomerRepository);
const mockUserManagementRepo    = jest.mocked(UserManagementRepository);
const mockSharedAuthService     = jest.mocked(SharedAuthService);
const mockHashPassword          = jest.mocked(hashPassword);
const mockPrisma                = prisma as jest.Mocked<typeof prisma>;

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockUser = {
  id:           1,
  name:         'Sara Ahmed',
  email:        'sara@example.com',
  password:     '$2b$10$hashedpassword',
  userTypeCode: 'CUSTOMER',
  userRole:     [],
  createdAt:    new Date(),
  updatedAt:    new Date(),
};

const mockCustomer = {
  id:        10,
  userId:    1,
  phone:     '+966501234567',
  dob:       null,
  gender:    'female',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRegisterInput = {
  name:     'Sara Ahmed',
  email:    'sara@example.com',
  password: 'SecurePass123!',
  phone:    '+966501234567',
  gender:   'female',
};

const mockLoginInput = {
  email:    'sara@example.com',
  password: 'SecurePass123!',
};

const mockTokens = {
  accessToken:  'mock.access.token',
  refreshToken: 'mock.refresh.token',
};

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
describe('CustomerService.register', () => {
  it('registers a new customer and returns user data', async () => {
    mockUserManagementRepo.findUserByEmail.mockResolvedValue(null);
    mockCustomerRepository.findCustomerByPhone.mockResolvedValue(null);
    mockHashPassword.mockResolvedValue('$2b$10$hashedpassword' as never);
    mockUserManagementRepo.createUser.mockResolvedValue(mockUser as any);
    mockCustomerRepository.createCustomer.mockResolvedValue(mockCustomer as any);

    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: Function) => cb({}));

    const result = await CustomerService.register(mockRegisterInput);

    expect(result.user.id).toBe(mockUser.id);
    expect(result.user.customerId).toBe(mockCustomer.id);
    expect(result.user.email).toBe(mockUser.email);
    expect(result.user.phone).toBe(mockCustomer.phone);
  });

  it('throws EmailAlreadyRegistered when email exists', async () => {
    mockUserManagementRepo.findUserByEmail.mockResolvedValue(mockUser as any);

    await expect(CustomerService.register(mockRegisterInput)).rejects.toThrow(EmailAlreadyRegistered);
    expect(mockCustomerRepository.findCustomerByPhone).not.toHaveBeenCalled();
  });

  it('throws PhoneAlreadyRegistered when phone exists', async () => {
    mockUserManagementRepo.findUserByEmail.mockResolvedValue(null);
    mockCustomerRepository.findCustomerByPhone.mockResolvedValue(mockCustomer as any);

    await expect(CustomerService.register(mockRegisterInput)).rejects.toThrow(PhoneAlreadyRegistered);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('uses null for optional dob when not provided', async () => {
    mockUserManagementRepo.findUserByEmail.mockResolvedValue(null);
    mockCustomerRepository.findCustomerByPhone.mockResolvedValue(null);
    mockHashPassword.mockResolvedValue('$2b$10$hashed' as never);

    mockUserManagementRepo.createUser.mockResolvedValue(mockUser as any);
    const createCustomerMock = mockCustomerRepository.createCustomer.mockResolvedValue(mockCustomer as any);
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: Function) => cb({}));

    const inputWithoutDob = { ...mockRegisterInput };
    delete (inputWithoutDob as any).dob;

    await CustomerService.register(inputWithoutDob);

    expect(createCustomerMock).toHaveBeenCalledWith(
      mockUser.id,
      expect.objectContaining({ dob: null }),
      {},
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('CustomerService.login', () => {
  it('returns access and refresh tokens on valid credentials', async () => {
    mockSharedAuthService.login.mockResolvedValue(mockTokens);

    const result = await CustomerService.login(mockLoginInput);

    expect(mockSharedAuthService.login).toHaveBeenCalledWith(
      mockLoginInput.email,
      mockLoginInput.password,
      expect.any(Function),
      undefined,
    );
    expect(result.accessToken).toBe(mockTokens.accessToken);
    expect(result.refreshToken).toBe(mockTokens.refreshToken);
  });

  it('throws InvalidCredentials when SharedAuthService rejects', async () => {
    mockSharedAuthService.login.mockRejectedValue(new InvalidCredentials());

    await expect(CustomerService.login(mockLoginInput)).rejects.toThrow(InvalidCredentials);
  });

  it('passes meta (ip and deviceInfo) to SharedAuthService', async () => {
    mockSharedAuthService.login.mockResolvedValue(mockTokens);
    const meta = { ip: '127.0.0.1', deviceInfo: 'Mozilla/5.0' };

    await CustomerService.login(mockLoginInput, meta);

    expect(mockSharedAuthService.login).toHaveBeenCalledWith(
      mockLoginInput.email,
      mockLoginInput.password,
      expect.any(Function),
      meta,
    );
  });

  it('throws InvalidCredentials when resolvePayload finds no customer', async () => {
    mockCustomerRepository.findCustomerByUserId.mockResolvedValue(null);

    // Simulate SharedAuthService.login calling resolvePayload with the user
    mockSharedAuthService.login.mockImplementation(async (_email, _pass, resolvePayload) => {
      await resolvePayload(mockUser as any);
      return mockTokens;
    });

    await expect(CustomerService.login(mockLoginInput)).rejects.toThrow(InvalidCredentials);
  });

  it('resolvePayload returns customerId when customer exists', async () => {
    mockCustomerRepository.findCustomerByUserId.mockResolvedValue(mockCustomer as any);

    let capturedPayload: any;
    mockSharedAuthService.login.mockImplementation(async (_email, _pass, resolvePayload) => {
      capturedPayload = await resolvePayload(mockUser as any);
      return mockTokens;
    });

    await CustomerService.login(mockLoginInput);

    expect(capturedPayload).toEqual({ customerId: mockCustomer.id });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('CustomerService.refreshToken', () => {
  const refreshInput = { refreshToken: 'valid.refresh.token' };

  it('returns new tokens on valid refresh token', async () => {
    mockSharedAuthService.refreshToken.mockResolvedValue(mockTokens);

    const result = await CustomerService.refreshToken(refreshInput);

    expect(mockSharedAuthService.refreshToken).toHaveBeenCalledWith(
      refreshInput.refreshToken,
      expect.any(Function),
      undefined,
    );
    expect(result).toEqual(mockTokens);
  });

  it('throws InvalidToken when SharedAuthService rejects', async () => {
    mockSharedAuthService.refreshToken.mockRejectedValue(new InvalidToken());

    await expect(CustomerService.refreshToken(refreshInput)).rejects.toThrow(InvalidToken);
  });

  it('throws InvalidToken when resolvePayload finds no customer', async () => {
    mockCustomerRepository.findCustomerByUserId.mockResolvedValue(null);

    mockSharedAuthService.refreshToken.mockImplementation(async (_token, resolvePayload) => {
      await resolvePayload(mockUser as any);
      return mockTokens;
    });

    await expect(CustomerService.refreshToken(refreshInput)).rejects.toThrow(InvalidToken);
  });

  it('resolvePayload returns customerId when customer exists', async () => {
    mockCustomerRepository.findCustomerByUserId.mockResolvedValue(mockCustomer as any);

    let capturedPayload: any;
    mockSharedAuthService.refreshToken.mockImplementation(async (_token, resolvePayload) => {
      capturedPayload = await resolvePayload(mockUser as any);
      return mockTokens;
    });

    await CustomerService.refreshToken(refreshInput);

    expect(capturedPayload).toEqual({ customerId: mockCustomer.id });
  });

  it('passes meta to SharedAuthService', async () => {
    mockSharedAuthService.refreshToken.mockResolvedValue(mockTokens);
    const meta = { ip: '10.0.0.1', deviceInfo: 'Chrome/120' };

    await CustomerService.refreshToken(refreshInput, meta);

    expect(mockSharedAuthService.refreshToken).toHaveBeenCalledWith(
      refreshInput.refreshToken,
      expect.any(Function),
      meta,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('CustomerService.logout', () => {
  it('clears refresh token and returns empty object', async () => {
    mockSharedAuthService.clearRefreshToken.mockResolvedValue(undefined);

    const result = await CustomerService.logout(mockUser.id, mockTokens.refreshToken);

    expect(mockSharedAuthService.clearRefreshToken).toHaveBeenCalledWith(
      mockUser.id,
      expect.any(CustomerNotFound),
      mockTokens.refreshToken,
    );
    expect(result).toEqual({});
  });

  it('calls clearRefreshToken without token when no refreshToken provided', async () => {
    mockSharedAuthService.clearRefreshToken.mockResolvedValue(undefined);

    await CustomerService.logout(mockUser.id);

    expect(mockSharedAuthService.clearRefreshToken).toHaveBeenCalledWith(
      mockUser.id,
      expect.any(CustomerNotFound),
      undefined,
    );
  });

  it('throws CustomerNotFound when SharedAuthService throws', async () => {
    mockSharedAuthService.clearRefreshToken.mockRejectedValue(new CustomerNotFound());

    await expect(CustomerService.logout(999)).rejects.toThrow(CustomerNotFound);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('CustomerService.forgotPassword', () => {
  it('delegates to SharedAuthService and returns empty object', async () => {
    mockSharedAuthService.forgotPassword.mockResolvedValue(undefined);

    const result = await CustomerService.forgotPassword({ email: 'sara@example.com' });

    expect(mockSharedAuthService.forgotPassword).toHaveBeenCalledWith(
      'sara@example.com',
      expect.any(Function),
      '/reset-password.html',
      expect.objectContaining({ subject: expect.stringContaining('Foodlify') }),
    );
    expect(result).toEqual({});
  });

  it('html builder produces non-empty string containing reset link', async () => {
    let capturedHtml: ((link: string) => string) | undefined;

    mockSharedAuthService.forgotPassword.mockImplementation(
      async (_email, _validate, _path, emailOptions) => {
        capturedHtml = (emailOptions as any).html;
      },
    );

    await CustomerService.forgotPassword({ email: 'sara@example.com' });

    const output = capturedHtml!('https://foodlify.com/reset-password.html?token=abc');
    expect(typeof output).toBe('string');
    expect(output).toContain('https://foodlify.com/reset-password.html?token=abc');
  });

  it('validate fn returns true for CUSTOMER user type', async () => {
    let capturedValidate: ((user: any) => boolean) | undefined;

    mockSharedAuthService.forgotPassword.mockImplementation(async (_email, validate) => {
      capturedValidate = validate;
    });

    await CustomerService.forgotPassword({ email: 'sara@example.com' });

    expect(capturedValidate!({ userTypeCode: 'customer' })).toBe(true);
    expect(capturedValidate!({ userTypeCode: 'admin' })).toBe(false);
  });

  it('does not throw when email does not exist (silent failure)', async () => {
    mockSharedAuthService.forgotPassword.mockResolvedValue(undefined);

    await expect(
      CustomerService.forgotPassword({ email: 'nonexistent@example.com' }),
    ).resolves.toEqual({});
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('CustomerService.resetPasswordFromLink', () => {
  it('calls SharedAuthService and returns empty object', async () => {
    mockSharedAuthService.resetPasswordFromLink.mockResolvedValue(undefined);

    const result = await CustomerService.resetPasswordFromLink({
      token:       'valid.reset.token',
      newPassword: 'NewSecurePass123!',
    });

    expect(mockSharedAuthService.resetPasswordFromLink).toHaveBeenCalledWith(
      'valid.reset.token',
      'NewSecurePass123!',
    );
    expect(result).toEqual({});
  });

  it('throws InvalidToken when token is invalid or expired', async () => {
    mockSharedAuthService.resetPasswordFromLink.mockRejectedValue(new InvalidToken());

    await expect(
      CustomerService.resetPasswordFromLink({ token: 'expired.token', newPassword: 'NewPass123!' }),
    ).rejects.toThrow(InvalidToken);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('CustomerService.changePassword', () => {
  const changePasswordInput = {
    oldPassword: 'OldPass123!',
    newPassword: 'NewPass456!',
  };

  it('changes password and returns empty object', async () => {
    mockSharedAuthService.changePassword.mockResolvedValue(undefined);

    const result = await CustomerService.changePassword(mockUser.id, changePasswordInput);

    expect(mockSharedAuthService.changePassword).toHaveBeenCalledWith(
      mockUser.id,
      changePasswordInput.oldPassword,
      changePasswordInput.newPassword,
      expect.any(CustomerNotFound),
    );
    expect(result).toEqual({});
  });

  it('throws CustomerNotFound when user does not exist', async () => {
    mockSharedAuthService.changePassword.mockRejectedValue(new CustomerNotFound());

    await expect(
      CustomerService.changePassword(999, changePasswordInput),
    ).rejects.toThrow(CustomerNotFound);
  });

  it('throws PasswordMismatch when old password is wrong', async () => {
    mockSharedAuthService.changePassword.mockRejectedValue(new PasswordMismatch());

    await expect(
      CustomerService.changePassword(mockUser.id, { oldPassword: 'Wrong!', newPassword: 'New123!' }),
    ).rejects.toThrow(PasswordMismatch);
  });
});
