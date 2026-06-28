import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../../src/modules/userManagement/services/shared-auth.service');
jest.mock('../../src/shared_infrastructure/logger/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { UserAuthService } from '../../src/modules/userManagement/services/auth.service';
import { SharedAuthService } from '../../src/modules/userManagement/services/shared-auth.service';
import {
  InvalidCredentials,
  InvalidToken,
  UserNotFound,
  PasswordMismatch,
} from '../../src/modules/userManagement/user.exception';

const mockSharedAuth = jest.mocked(SharedAuthService);

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockTokens = {
  accessToken:  'access.token.mock',
  refreshToken: 'refresh.token.mock',
};

const mockUserWithRole = {
  id:           1,
  name:         'Admin User',
  email:        'admin@foodlify.com',
  password:     '$2b$10$hashed',
  userTypeCode: 'admin',
  userRole:     { role: { name: 'SUPER_ADMIN' as any } },
  createdAt:    new Date(),
  updatedAt:    new Date(),
};

const mockUserNoRole = { ...mockUserWithRole, userRole: null };

beforeEach(() => {
  jest.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
describe('UserAuthService.login', () => {
  const loginInput = { email: 'admin@foodlify.com', password: 'AdminPass123!' };

  it('returns tokens on valid credentials', async () => {
    mockSharedAuth.login.mockResolvedValue(mockTokens);

    const result = await UserAuthService.login(loginInput);

    expect(mockSharedAuth.login).toHaveBeenCalledWith(
      loginInput.email,
      loginInput.password,
      expect.any(Function),
      undefined,
    );
    expect(result).toEqual(mockTokens);
  });

  it('passes meta to SharedAuthService', async () => {
    mockSharedAuth.login.mockResolvedValue(mockTokens);
    const meta = { ip: '192.168.1.1', deviceInfo: 'Chrome/120' };

    await UserAuthService.login(loginInput, meta);

    expect(mockSharedAuth.login).toHaveBeenCalledWith(
      loginInput.email,
      loginInput.password,
      expect.any(Function),
      meta,
    );
  });

  it('throws InvalidCredentials when SharedAuthService rejects', async () => {
    mockSharedAuth.login.mockRejectedValue(new InvalidCredentials());

    await expect(UserAuthService.login(loginInput)).rejects.toThrow(InvalidCredentials);
  });

  it('resolvePayload returns userId and role when userRole exists', async () => {
    let capturedPayload: any;
    mockSharedAuth.login.mockImplementation(async (_e, _p, resolvePayload) => {
      capturedPayload = resolvePayload(mockUserWithRole as any);
      return mockTokens;
    });

    await UserAuthService.login(loginInput);

    expect(capturedPayload).toEqual({ userId: mockUserWithRole.id, role: 'SUPER_ADMIN' });
  });

  it('resolvePayload throws InvalidCredentials when userRole is null', async () => {
    mockSharedAuth.login.mockImplementation(async (_e, _p, resolvePayload) => {
      resolvePayload(mockUserNoRole as any);
      return mockTokens;
    });

    await expect(UserAuthService.login(loginInput)).rejects.toThrow(InvalidCredentials);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('UserAuthService.refreshToken', () => {
  const token = 'valid.refresh.token';

  it('returns new tokens on valid refresh token', async () => {
    mockSharedAuth.refreshToken.mockResolvedValue(mockTokens);

    const result = await UserAuthService.refreshToken(token);

    expect(mockSharedAuth.refreshToken).toHaveBeenCalledWith(
      token,
      expect.any(Function),
      undefined,
    );
    expect(result).toEqual(mockTokens);
  });

  it('passes meta to SharedAuthService', async () => {
    mockSharedAuth.refreshToken.mockResolvedValue(mockTokens);
    const meta = { ip: '10.0.0.1', deviceInfo: 'Safari/17' };

    await UserAuthService.refreshToken(token, meta);

    expect(mockSharedAuth.refreshToken).toHaveBeenCalledWith(token, expect.any(Function), meta);
  });

  it('throws InvalidToken when SharedAuthService rejects', async () => {
    mockSharedAuth.refreshToken.mockRejectedValue(new InvalidToken());

    await expect(UserAuthService.refreshToken(token)).rejects.toThrow(InvalidToken);
  });

  it('resolvePayload returns userId and role when userRole exists', async () => {
    let capturedPayload: any;
    mockSharedAuth.refreshToken.mockImplementation(async (_t, resolvePayload) => {
      capturedPayload = resolvePayload(mockUserWithRole as any);
      return mockTokens;
    });

    await UserAuthService.refreshToken(token);

    expect(capturedPayload).toEqual({ userId: mockUserWithRole.id, role: 'SUPER_ADMIN' });
  });

  it('resolvePayload throws InvalidToken when userRole is null', async () => {
    mockSharedAuth.refreshToken.mockImplementation(async (_t, resolvePayload) => {
      resolvePayload(mockUserNoRole as any);
      return mockTokens;
    });

    await expect(UserAuthService.refreshToken(token)).rejects.toThrow(InvalidToken);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('UserAuthService.logout', () => {
  it('clears refresh token for given userId and token', async () => {
    mockSharedAuth.clearRefreshToken.mockResolvedValue(undefined);

    await UserAuthService.logout(1, 'refresh.token');

    expect(mockSharedAuth.clearRefreshToken).toHaveBeenCalledWith(
      1,
      expect.any(UserNotFound),
      'refresh.token',
    );
  });

  it('calls clearRefreshToken without token when none provided', async () => {
    mockSharedAuth.clearRefreshToken.mockResolvedValue(undefined);

    await UserAuthService.logout(1);

    expect(mockSharedAuth.clearRefreshToken).toHaveBeenCalledWith(
      1,
      expect.any(UserNotFound),
      undefined,
    );
  });

  it('throws UserNotFound when user does not exist', async () => {
    mockSharedAuth.clearRefreshToken.mockRejectedValue(new UserNotFound());

    await expect(UserAuthService.logout(999)).rejects.toThrow(UserNotFound);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('UserAuthService.forgotPassword', () => {
  it('delegates to SharedAuthService', async () => {
    mockSharedAuth.forgotPassword.mockResolvedValue(undefined);

    await UserAuthService.forgotPassword({ email: 'admin@foodlify.com' });

    expect(mockSharedAuth.forgotPassword).toHaveBeenCalledWith(
      'admin@foodlify.com',
      expect.any(Function),
      '/dashboard/reset-password',
      expect.objectContaining({ subject: expect.stringContaining('Foodlify') }),
    );
  });

  it('html builder produces non-empty string containing reset link', async () => {
    let capturedHtml: ((link: string) => string) | undefined;

    mockSharedAuth.forgotPassword.mockImplementation(
      async (_email, _validate, _path, emailOptions) => {
        capturedHtml = (emailOptions as any).html;
      },
    );

    await UserAuthService.forgotPassword({ email: 'admin@foodlify.com' });

    const output = capturedHtml!('https://foodlify.com/dashboard/reset-password?token=xyz');
    expect(typeof output).toBe('string');
    expect(output).toContain('https://foodlify.com/dashboard/reset-password?token=xyz');
  });

  it('validate fn returns true for ADMIN user type only', async () => {
    let capturedValidate: ((u: any) => boolean) | undefined;
    mockSharedAuth.forgotPassword.mockImplementation(async (_e, validate) => {
      capturedValidate = validate;
    });

    await UserAuthService.forgotPassword({ email: 'admin@foodlify.com' });

    expect(capturedValidate!({ userTypeCode: 'admin' })).toBe(true);
    expect(capturedValidate!({ userTypeCode: 'customer' })).toBe(false);
  });

  it('does not throw when email not found (silent)', async () => {
    mockSharedAuth.forgotPassword.mockResolvedValue(undefined);

    await expect(
      UserAuthService.forgotPassword({ email: 'unknown@example.com' }),
    ).resolves.toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('UserAuthService.resetPasswordFromLink', () => {
  it('delegates to SharedAuthService', async () => {
    mockSharedAuth.resetPasswordFromLink.mockResolvedValue(undefined);

    await UserAuthService.resetPasswordFromLink({ token: 'valid.token', newPassword: 'NewPass123!' });

    expect(mockSharedAuth.resetPasswordFromLink).toHaveBeenCalledWith('valid.token', 'NewPass123!');
  });

  it('throws InvalidToken when token invalid or expired', async () => {
    mockSharedAuth.resetPasswordFromLink.mockRejectedValue(new InvalidToken());

    await expect(
      UserAuthService.resetPasswordFromLink({ token: 'bad.token', newPassword: 'NewPass123!' }),
    ).rejects.toThrow(InvalidToken);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('UserAuthService.changePassword', () => {
  const changeInput = { oldPassword: 'OldPass123!', newPassword: 'NewPass456!' };

  it('delegates to SharedAuthService', async () => {
    mockSharedAuth.changePassword.mockResolvedValue(undefined);

    await UserAuthService.changePassword(1, changeInput);

    expect(mockSharedAuth.changePassword).toHaveBeenCalledWith(
      1,
      changeInput.oldPassword,
      changeInput.newPassword,
      expect.any(UserNotFound),
    );
  });

  it('throws UserNotFound when user does not exist', async () => {
    mockSharedAuth.changePassword.mockRejectedValue(new UserNotFound());

    await expect(UserAuthService.changePassword(999, changeInput)).rejects.toThrow(UserNotFound);
  });

  it('throws PasswordMismatch when old password wrong', async () => {
    mockSharedAuth.changePassword.mockRejectedValue(new PasswordMismatch());

    await expect(
      UserAuthService.changePassword(1, { oldPassword: 'WrongOld!', newPassword: 'New123!' }),
    ).rejects.toThrow(PasswordMismatch);
  });
});
