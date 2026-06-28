import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../../src/modules/userManagement/repositories/userManagement.repository');
jest.mock('../../src/modules/userManagement/services/shared-auth.service');
jest.mock('../../src/shared_infrastructure/logger/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { ProfileService } from '../../src/modules/userManagement/services/profile.service';
import { UserManagementRepository } from '../../src/modules/userManagement/repositories/userManagement.repository';
import { SharedAuthService } from '../../src/modules/userManagement/services/shared-auth.service';
import {
  UserNotFound,
  UserEmailTaken,
  InvalidCredentials,
} from '../../src/modules/userManagement/user.exception';

const mockRepo       = jest.mocked(UserManagementRepository);
const mockSharedAuth = jest.mocked(SharedAuthService);

// ── Mock data ─────────────────────────────────────────────────────────────────

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

const mockUserResponse = {
  id:    1,
  name:  'Admin User',
  email: 'admin@foodlify.com',
  role:  'SUPER_ADMIN' as any,
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ProfileService.getProfile', () => {
  it('returns user profile when user exists', async () => {
    mockRepo.findUserById.mockResolvedValue(mockUserWithRole as any);

    const result = await ProfileService.getProfile(1);

    expect(mockRepo.findUserById).toHaveBeenCalledWith(1);
    expect(result).toMatchObject(mockUserResponse);
  });

  it('throws UserNotFound when user does not exist', async () => {
    mockRepo.findUserById.mockResolvedValue(null);

    await expect(ProfileService.getProfile(999)).rejects.toThrow(UserNotFound);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ProfileService.updateProfile', () => {
  const updateInput = { name: 'Updated Name' };

  it('updates and returns updated profile', async () => {
    const updatedUser = { ...mockUserWithRole, name: 'Updated Name' };
    mockRepo.findUserById.mockResolvedValue(mockUserWithRole as any);
    mockRepo.updateUser.mockResolvedValue(updatedUser as any);

    const result = await ProfileService.updateProfile(1, updateInput);

    expect(mockRepo.findUserById).toHaveBeenCalledWith(1);
    expect(mockRepo.updateUser).toHaveBeenCalledWith(1, updateInput);
    expect(result.name).toBe('Updated Name');
  });

  it('throws UserNotFound when user does not exist', async () => {
    mockRepo.findUserById.mockResolvedValue(null);

    await expect(ProfileService.updateProfile(999, updateInput)).rejects.toThrow(UserNotFound);
    expect(mockRepo.updateUser).not.toHaveBeenCalled();
  });

  it('updates with empty data object without error', async () => {
    mockRepo.findUserById.mockResolvedValue(mockUserWithRole as any);
    mockRepo.updateUser.mockResolvedValue(mockUserWithRole as any);

    const result = await ProfileService.updateProfile(1, {});

    expect(mockRepo.updateUser).toHaveBeenCalledWith(1, {});
    expect(result).toMatchObject(mockUserResponse);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ProfileService.updateEmail', () => {
  const updateEmailInput = {
    currentPassword: 'CurrentPass123!',
    newEmail:        'newemail@foodlify.com',
  };

  it('returns new email on success', async () => {
    mockSharedAuth.updateEmail.mockResolvedValue({ email: 'newemail@foodlify.com' });

    const result = await ProfileService.updateEmail(1, updateEmailInput);

    expect(mockSharedAuth.updateEmail).toHaveBeenCalledWith(
      1,
      updateEmailInput.currentPassword,
      updateEmailInput.newEmail,
      expect.any(UserNotFound),
      expect.any(UserEmailTaken),
    );
    expect(result.email).toBe('newemail@foodlify.com');
  });

  it('throws UserNotFound when user does not exist', async () => {
    mockSharedAuth.updateEmail.mockRejectedValue(new UserNotFound());

    await expect(ProfileService.updateEmail(999, updateEmailInput)).rejects.toThrow(UserNotFound);
  });

  it('throws InvalidCredentials when password is wrong', async () => {
    mockSharedAuth.updateEmail.mockRejectedValue(new InvalidCredentials());

    await expect(
      ProfileService.updateEmail(1, { ...updateEmailInput, currentPassword: 'WrongPass!' }),
    ).rejects.toThrow(InvalidCredentials);
  });

  it('throws UserEmailTaken when new email already registered', async () => {
    mockSharedAuth.updateEmail.mockRejectedValue(new UserEmailTaken());

    await expect(
      ProfileService.updateEmail(1, { ...updateEmailInput, newEmail: 'taken@foodlify.com' }),
    ).rejects.toThrow(UserEmailTaken);
  });
});
