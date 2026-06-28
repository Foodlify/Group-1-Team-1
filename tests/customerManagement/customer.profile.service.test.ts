import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../../src/modules/customerManagement/Repositories/customer.repository');
jest.mock('../../src/modules/userManagement/repositories/userManagement.repository');
jest.mock('../../src/modules/userManagement/services/shared-auth.service');
jest.mock('../../src/shared_infrastructure/logger/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: { $transaction: jest.fn() },
}));

import { CustomerProfileService } from '../../src/modules/customerManagement/Services/customer.profile.service';
import { CustomerRepository } from '../../src/modules/customerManagement/Repositories/customer.repository';
import { UserManagementRepository } from '../../src/modules/userManagement/repositories/userManagement.repository';
import { SharedAuthService } from '../../src/modules/userManagement/services/shared-auth.service';
import prisma from '../../lib/prisma';
import {
  CustomerNotFound,
  EmailAlreadyRegistered,
  InvalidCredentials,
} from '../../src/modules/customerManagement/customer.exception';

const mockCustomerRepo  = jest.mocked(CustomerRepository);
const mockUserRepo      = jest.mocked(UserManagementRepository);
const mockSharedAuth    = jest.mocked(SharedAuthService);
const mockPrisma        = prisma as jest.Mocked<typeof prisma>;

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockCustomerWithUser = {
  id:        10,
  userId:    1,
  phone:     '+966501234567',
  dob:       new Date('1995-06-15'),
  gender:    'female',
  createdAt: new Date(),
  updatedAt: new Date(),
  user: {
    id:           1,
    name:         'Sara Ahmed',
    email:        'sara@example.com',
    password:     '$2b$10$hashed',
    userTypeCode: 'customer',
    createdAt:    new Date(),
    updatedAt:    new Date(),
  },
};

const mockProfileResponse = {
  id:         1,
  customerId: 10,
  name:       'Sara Ahmed',
  email:      'sara@example.com',
  phone:      '+966501234567',
  dob:        '1995-06-15',
  gender:     'female',
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
describe('CustomerProfileService.getCustomerProfile', () => {
  it('returns formatted customer profile', async () => {
    mockCustomerRepo.findCustomerByUserId.mockResolvedValue(mockCustomerWithUser as any);

    const result = await CustomerProfileService.getCustomerProfile(1);

    expect(mockCustomerRepo.findCustomerByUserId).toHaveBeenCalledWith(1, true);
    expect(result).toMatchObject(mockProfileResponse);
  });

  it('formats dob as YYYY-MM-DD string', async () => {
    mockCustomerRepo.findCustomerByUserId.mockResolvedValue(mockCustomerWithUser as any);

    const result = await CustomerProfileService.getCustomerProfile(1);

    expect(result.dob).toBe('1995-06-15');
  });

  it('returns null dob when customer has no dob', async () => {
    mockCustomerRepo.findCustomerByUserId.mockResolvedValue({
      ...mockCustomerWithUser,
      dob: null,
    } as any);

    const result = await CustomerProfileService.getCustomerProfile(1);

    expect(result.dob).toBeNull();
  });

  it('throws CustomerNotFound when customer does not exist', async () => {
    mockCustomerRepo.findCustomerByUserId.mockResolvedValue(null);

    await expect(CustomerProfileService.getCustomerProfile(999)).rejects.toThrow(CustomerNotFound);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('CustomerProfileService.updateEmail', () => {
  const updateEmailInput = {
    currentPassword: 'CurrentPass123!',
    newEmail:        'newemail@example.com',
  };

  it('returns updated email on success', async () => {
    mockSharedAuth.updateEmail.mockResolvedValue({ email: 'newemail@example.com' });

    const result = await CustomerProfileService.updateEmail(1, updateEmailInput);

    expect(mockSharedAuth.updateEmail).toHaveBeenCalledWith(
      1,
      updateEmailInput.currentPassword,
      updateEmailInput.newEmail,
      expect.any(CustomerNotFound),
      expect.any(EmailAlreadyRegistered),
    );
    expect(result.email).toBe('newemail@example.com');
  });

  it('throws CustomerNotFound when user does not exist', async () => {
    mockSharedAuth.updateEmail.mockRejectedValue(new CustomerNotFound());

    await expect(CustomerProfileService.updateEmail(999, updateEmailInput)).rejects.toThrow(CustomerNotFound);
  });

  it('throws InvalidCredentials when password is wrong', async () => {
    mockSharedAuth.updateEmail.mockRejectedValue(new InvalidCredentials());

    await expect(
      CustomerProfileService.updateEmail(1, { ...updateEmailInput, currentPassword: 'WrongPass!' }),
    ).rejects.toThrow(InvalidCredentials);
  });

  it('throws EmailAlreadyRegistered when new email taken', async () => {
    mockSharedAuth.updateEmail.mockRejectedValue(new EmailAlreadyRegistered());

    await expect(
      CustomerProfileService.updateEmail(1, { ...updateEmailInput, newEmail: 'taken@example.com' }),
    ).rejects.toThrow(EmailAlreadyRegistered);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('CustomerProfileService.updateCustomerProfile', () => {
  it('updates name and customer fields, returns updated profile', async () => {
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: Function) => cb({}));
    mockUserRepo.updateUser.mockResolvedValue({} as any);
    mockCustomerRepo.updateCustomer.mockResolvedValue({} as any);
    mockCustomerRepo.findCustomerByUserId.mockResolvedValue(mockCustomerWithUser as any);

    const result = await CustomerProfileService.updateCustomerProfile(1, {
      name:   'Sara Updated',
      phone:  '+966509999999',
      gender: 'female',
    });

    expect(mockUserRepo.updateUser).toHaveBeenCalledWith(1, { name: 'Sara Updated' }, {});
    expect(mockCustomerRepo.updateCustomer).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ phone: '+966509999999', gender: 'female' }),
      {},
    );
    expect(result).toMatchObject(mockProfileResponse);
  });

  it('skips user update when name not provided', async () => {
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: Function) => cb({}));
    mockCustomerRepo.updateCustomer.mockResolvedValue({} as any);
    mockCustomerRepo.findCustomerByUserId.mockResolvedValue(mockCustomerWithUser as any);

    await CustomerProfileService.updateCustomerProfile(1, { phone: '+966509999999' });

    expect(mockUserRepo.updateUser).not.toHaveBeenCalled();
  });

  it('skips customer update when no customer fields provided', async () => {
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: Function) => cb({}));
    mockUserRepo.updateUser.mockResolvedValue({} as any);
    mockCustomerRepo.findCustomerByUserId.mockResolvedValue(mockCustomerWithUser as any);

    await CustomerProfileService.updateCustomerProfile(1, { name: 'New Name Only' });

    expect(mockCustomerRepo.updateCustomer).not.toHaveBeenCalled();
  });

  it('throws CustomerNotFound when customer not found after update', async () => {
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: Function) => cb({}));
    mockCustomerRepo.findCustomerByUserId.mockResolvedValue(null);

    await expect(
      CustomerProfileService.updateCustomerProfile(999, { name: 'Ghost' }),
    ).rejects.toThrow(CustomerNotFound);
  });

  it('updates dob when provided', async () => {
    const dob = new Date('2000-01-01');
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: Function) => cb({}));
    mockCustomerRepo.updateCustomer.mockResolvedValue({} as any);
    mockCustomerRepo.findCustomerByUserId.mockResolvedValue(mockCustomerWithUser as any);

    await CustomerProfileService.updateCustomerProfile(1, { dob });

    expect(mockCustomerRepo.updateCustomer).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ dob }),
      {},
    );
  });
});
