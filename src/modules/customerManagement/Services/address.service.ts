import { Prisma } from '@prisma/client';
import { ENTITIES } from '../../../../prisma/entities';
import { NOT_FOUND } from '../../../shared_infrastructure/error/error.execption';
import { AddressRepository, createAddressData } from '../Repositories/address.repository';
import prisma from '../../../../lib/prisma';
import loggerService from '../../../shared_infrastructure/logger/logger';
import { CustomerRepository } from '../Repositories/customer.repository';
import { CustomerNotFound, InvalidCredentials } from '../customer.execption';

export class AddressService {
  static async getAddressByCustomerId(
    customerId: number,
    addressId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    loggerService.info('Fetching address', { customerId, addressId });

    const address = await AddressRepository.findAddressByIdAndCustomerId(
      addressId,
      customerId,
      db
    );
    if (!address) {
      loggerService.warn('Address not found', { customerId, addressId });
      throw new NOT_FOUND(ENTITIES.ADDRESS);
    }

    loggerService.info('Address fetched successfully', { customerId, addressId });
    return address;
  }

  static async createAddressByCustomerId(
    customerId: number,
    data: createAddressData,
  ){
  const customer = await CustomerRepository.findCustomerById(customerId);
  if (!customer) {
  throw new CustomerNotFound;
  }
  if (!data.city || !data.street) {
  throw new InvalidCredentials();
}
    return AddressRepository.createAddress(customerId,data) ;
}
}
