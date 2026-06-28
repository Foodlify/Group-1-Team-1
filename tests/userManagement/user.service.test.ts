import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../../src/modules/userManagement/repositories/userManagement.repository');
jest.mock('../../src/shared_infrastructure/auth/password.helper');
jest.mock('../../src/shared_infrastructure/logger/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: { $transaction: jest.fn() },
}));

import { UserService } from '../../src/modules/userManagement/services/user.service';
import { UserManagementRepository } from '../../src/modules/userManagement/repositories/userManagement.repository';
import { hashPassword } from '../../src/shared_infrastructure/auth/password.helper';
import prisma from '../../lib/prisma';
import {
  UserNotFound,
  UserEmailTaken,
  RoleNotFound,
} from '../../src/modules/userManagement/user.exception';

const mockRepo        = jest.mocked(UserManagementRepository);
const mockHashPwd     = jest.mocked(hashPassword);
const mockPrisma      = prisma as jest.Mocked<typeof prisma>;

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockRole = { id: 1, name: 'SUPER_ADMIN' as any };

const mockUserWithRole = {
  id:           1,
  name:         'Admin User',
  email:        'admin@foodlify.com',
  password:     '$2b$10$hashed',
  userTypeCode: 'admin',
  userRole:     { role: mockRole },
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
describe('UserService.getAllUsers', () => {
  it('returns mapped user list', async () => {
    mockRepo.findAllAdminUsers.mockResolvedValue([mockUserWithRole] as any);

    const result = await UserService.getAllUsers();

    expect(mockRepo.findAllAdminUsers).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject(mockUserResponse);
  });

  it('returns empty array when no users exist', async () => {
    mockRepo.findAllAdminUsers.mockResolvedValue([]);

    const result = await UserService.getAllUsers();

    expect(result).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('UserService.getUser', () => {
  it('returns user when found and is admin', async () => {
    mockRepo.findUserById.mockResolvedValue(mockUserWithRole as any);

    const result = await UserService.getUser(1);

    expect(result).toMatchObject(mockUserResponse);
  });

  it('throws UserNotFound when user does not exist', async () => {
    mockRepo.findUserById.mockResolvedValue(null);

    await expect(UserService.getUser(999)).rejects.toThrow(UserNotFound);
  });

  it('throws UserNotFound when user is not admin', async () => {
    mockRepo.findUserById.mockResolvedValue({
      ...mockUserWithRole,
      userTypeCode: 'customer',
    } as any);

    await expect(UserService.getUser(1)).rejects.toThrow(UserNotFound);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('UserService.createUser', () => {
  const createInput = {
    name:     'New Admin',
    email:    'newadmin@foodlify.com',
    password: 'SecurePass123!',
    role:     'SUPER_ADMIN' as any,
  };

  it('creates admin user and returns response', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(null);
    mockRepo.findRoleByName.mockResolvedValue(mockRole as any);
    mockHashPwd.mockResolvedValue('$2b$10$newhash' as never);
    mockRepo.createUser.mockResolvedValue({ ...mockUserWithRole, id: 2 } as any);
    mockRepo.assignRole.mockResolvedValue({} as any);
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: Function) => {
      await cb({});
      return 2;
    });
    mockRepo.findUserById.mockResolvedValue({ ...mockUserWithRole, id: 2 } as any);

    const result = await UserService.createUser(createInput);

    expect(result).toMatchObject({ id: 2, email: 'admin@foodlify.com' });
  });

  it('throws UserEmailTaken when email already registered', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(mockUserWithRole as any);

    await expect(UserService.createUser(createInput)).rejects.toThrow(UserEmailTaken);
    expect(mockRepo.findRoleByName).not.toHaveBeenCalled();
  });

  it('throws RoleNotFound when role does not exist', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(null);
    mockRepo.findRoleByName.mockResolvedValue(null);

    await expect(UserService.createUser(createInput)).rejects.toThrow(RoleNotFound);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('hashes password before storing', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(null);
    mockRepo.findRoleByName.mockResolvedValue(mockRole as any);
    mockHashPwd.mockResolvedValue('$2b$10$hashed' as never);
    mockRepo.createUser.mockResolvedValue(mockUserWithRole as any);
    mockRepo.assignRole.mockResolvedValue({} as any);
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: Function) => {
      await cb({});
      return 1;
    });
    mockRepo.findUserById.mockResolvedValue(mockUserWithRole as any);

    await UserService.createUser(createInput);

    expect(mockHashPwd).toHaveBeenCalledWith(createInput.password);
    expect(mockRepo.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ password: '$2b$10$hashed' }),
      {},
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('UserService.updateUser', () => {
  const updateInput = { name: 'Updated Admin', email: 'updated@foodlify.com' };

  it('updates and returns updated user', async () => {
    const updatedUser = { ...mockUserWithRole, name: 'Updated Admin', email: 'updated@foodlify.com' };
    mockRepo.findUserById.mockResolvedValue(mockUserWithRole as any);
    mockRepo.findUserByEmail.mockResolvedValue(null);
    mockRepo.updateUser.mockResolvedValue(updatedUser as any);

    const result = await UserService.updateUser(1, updateInput);

    expect(mockRepo.updateUser).toHaveBeenCalledWith(1, updateInput);
    expect(result.name).toBe('Updated Admin');
  });

  it('throws UserNotFound when user does not exist', async () => {
    mockRepo.findUserById.mockResolvedValue(null);

    await expect(UserService.updateUser(999, updateInput)).rejects.toThrow(UserNotFound);
  });

  it('throws UserNotFound when user is not admin', async () => {
    mockRepo.findUserById.mockResolvedValue({ ...mockUserWithRole, userTypeCode: 'customer' } as any);

    await expect(UserService.updateUser(1, updateInput)).rejects.toThrow(UserNotFound);
  });

  it('throws UserEmailTaken when new email already used by another user', async () => {
    const otherUser = { ...mockUserWithRole, id: 2, email: 'updated@foodlify.com' };
    mockRepo.findUserById.mockResolvedValue(mockUserWithRole as any);
    mockRepo.findUserByEmail.mockResolvedValue(otherUser as any);

    await expect(UserService.updateUser(1, updateInput)).rejects.toThrow(UserEmailTaken);
  });

  it('skips email uniqueness check when email unchanged', async () => {
    const sameEmailInput = { email: mockUserWithRole.email };
    mockRepo.findUserById.mockResolvedValue(mockUserWithRole as any);
    mockRepo.updateUser.mockResolvedValue(mockUserWithRole as any);

    await UserService.updateUser(1, sameEmailInput);

    expect(mockRepo.findUserByEmail).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('UserService.deleteUser', () => {
  it('deletes admin user', async () => {
    mockRepo.findUserById.mockResolvedValue(mockUserWithRole as any);
    mockRepo.deleteUser.mockResolvedValue(mockUserWithRole as any);

    await UserService.deleteUser(1);

    expect(mockRepo.deleteUser).toHaveBeenCalledWith(1);
  });

  it('throws UserNotFound when user does not exist', async () => {
    mockRepo.findUserById.mockResolvedValue(null);

    await expect(UserService.deleteUser(999)).rejects.toThrow(UserNotFound);
  });

  it('throws UserNotFound when user is not admin', async () => {
    mockRepo.findUserById.mockResolvedValue({ ...mockUserWithRole, userTypeCode: 'customer' } as any);

    await expect(UserService.deleteUser(1)).rejects.toThrow(UserNotFound);
    expect(mockRepo.deleteUser).not.toHaveBeenCalled();
  });
});
