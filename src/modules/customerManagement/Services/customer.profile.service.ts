import { CustomerRepository } from '../Repositories/customer.repository';
import { UserManagementRepository } from '../../userManagement/repositories/userManagement.repository';
import { CustomerNotFound, InvalidCredentials, EmailAlreadyRegistered } from '../customer.execption';
import { UpdateCustomerProfileInput, CustomerProfileResponse } from '../customer.model';
import loggerService from '../../../shared_infrastructure/logger/logger';
import { comparePassword } from '../../../shared_infrastructure/auth/password.helper';
import { UpdateEmailInput } from '../../../shared_infrastructure/auth/email-update.helper';

function formatDob(dob: Date | null): string | null {
  if (!dob) return null;
  return dob.toISOString().substring(0, 10);
}

export class CustomerProfileService {
  static async getCustomerProfile(userId: number): Promise<CustomerProfileResponse> {
    loggerService.info('Get customer profile', { userId });
    const user = await CustomerRepository.findUserWithCustomerById(userId);
    if (!user || !user.customer) throw new CustomerNotFound();
    const { customer } = user;
    return {
      id:         user.id,
      customerId: customer.id,
      name:       user.name,
      email:      user.email,
      phone:      customer.phone,
      dob:        formatDob(customer.dob),
      gender:     customer.gender,
    };
  }

  static async updateEmail(userId: number, data: UpdateEmailInput): Promise<{ email: string }> {
    loggerService.info('Update customer email', { userId });
    const { currentPassword, newEmail } = data;

    const user = await CustomerRepository.findUserWithCustomerById(userId);
    if (!user || !user.customer) throw new CustomerNotFound();

    const passwordValid = await comparePassword(currentPassword, user.password);
    if (!passwordValid) throw new InvalidCredentials();

    if (newEmail !== user.email) {
      const taken = await CustomerRepository.findUserByEmail(newEmail);
      if (taken) throw new EmailAlreadyRegistered();
    }

    await UserManagementRepository.updateUserEmail(userId, newEmail);
    return { email: newEmail };
  }

  static async updateCustomerProfile(userId: number, data: UpdateCustomerProfileInput): Promise<CustomerProfileResponse> {
    loggerService.info('Update customer profile', { userId });
    const { name, phone, dob, gender } = data;
    const user = await CustomerRepository.updateUserWithCustomer(
      userId,
      { ...(name !== undefined && { name }) },
      {
        ...(phone  !== undefined && { phone }),
        ...(dob    !== undefined && { dob: new Date(`${dob.substring(0, 10)}T00:00:00.000Z`) }),
        ...(gender !== undefined && { gender }),
      },
    );
    const { customer } = user;
    return {
      id:         user.id,
      customerId: customer!.id,
      name:       user.name,
      email:      user.email,
      phone:      customer!.phone,
      dob:        formatDob(customer!.dob),
      gender:     customer!.gender,
    };
  }
}
