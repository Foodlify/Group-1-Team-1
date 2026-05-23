import { Prisma } from '@prisma/client';
import { ENTITIES } from '../../../../prisma/entities';
import { NOT_FOUND } from '../../../shared_infrastructure/error/error.execption';
import { AddressRepository } from '../Repositories/address.repository';
import prisma from '../../../../lib/prisma';
import loggerService from '../../../shared_infrastructure/logger/logger';

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
}
