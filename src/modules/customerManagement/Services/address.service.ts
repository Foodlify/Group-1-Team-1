import { Prisma } from '@prisma/client';
import { ENTITIES } from '../../../../prisma/entities';
import { NOT_FOUND } from '../../../shared_infrastructure/error/error.execption';
import { AddressRepository } from '../Repositories/address.repository';
import prisma from '../../../../lib/prisma';

export class AddressService {
  static async getAddressByCustomerId(
    customerId: number,
    addressId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    const address = await AddressRepository.findAddressByIdAndCustomerId(
      addressId,
      customerId,
      db
    );
    if (!address) {
      throw new NOT_FOUND(ENTITIES.ADDRESS);
    }
    return address;
  }
}
