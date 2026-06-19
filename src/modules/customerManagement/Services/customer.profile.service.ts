import prisma from '../../../../lib/prisma';
import { CustomerRepository } from '../Repositories/customer.repository';
import { UserManagementRepository } from '../../userManagement/repositories/userManagement.repository';
import { SharedAuthService } from '../../userManagement/services/shared-auth.service';
import { CustomerNotFound, EmailAlreadyRegistered } from '../customer.exception';
import { UpdateCustomerProfileInput, CustomerProfileResponse } from '../customer.model';
import loggerService from '../../../shared_infrastructure/logger/logger';
import { UpdateEmailInput } from '../../../shared_infrastructure/auth/email-update.helper';
import { Prisma } from '@prisma/client';

type CustomerWithUser = Prisma.CustomerGetPayload<{ include: { user: true } }>;

function formatDob(dob: Date | null): string | null {
  if (!dob) return null;
  return dob.toISOString().substring(0, 10);
}

function toCustomerProfileResponse(customer: CustomerWithUser): CustomerProfileResponse {
  return {
    id:         customer.user.id,
    customerId: customer.id,
    name:       customer.user.name,
    email:      customer.user.email,
    phone:      customer.phone,
    dob:        formatDob(customer.dob),
    gender:     customer.gender,
  };
}

export class CustomerProfileService {
  static async getCustomerProfile(userId: number): Promise<CustomerProfileResponse> {
    loggerService.info('Get customer profile', { userId });
    const customer = await CustomerRepository.findCustomerByUserId(userId, true);
    if (!customer) throw new CustomerNotFound();
    return toCustomerProfileResponse(customer);
  }

  static async updateEmail(userId: number, data: UpdateEmailInput): Promise<{ email: string }> {
    loggerService.info('Update customer email', { userId });
    return SharedAuthService.updateEmail(userId, data.currentPassword, data.newEmail, new CustomerNotFound(), new EmailAlreadyRegistered());
  }

  static async updateCustomerProfile(userId: number, data: UpdateCustomerProfileInput): Promise<CustomerProfileResponse> {
    loggerService.info('Update customer profile', { userId });
    const { name, phone, dob, gender } = data;

    await prisma.$transaction(async (tx) => {
      if (name !== undefined) {
        await UserManagementRepository.updateUser(userId, { name }, tx);
      }
      const customerData = {
        ...(phone  !== undefined && { phone }),
        ...(dob    !== undefined && { dob }),
        ...(gender !== undefined && { gender }),
      };
      // skip customer update if no customer fields were provided
      if (Object.keys(customerData).length > 0) {
        await CustomerRepository.updateCustomer(userId, customerData, tx);
      }
    });

    const customer = await CustomerRepository.findCustomerByUserId(userId, true);
    if (!customer) throw new CustomerNotFound();
    return toCustomerProfileResponse(customer);
  }
}
