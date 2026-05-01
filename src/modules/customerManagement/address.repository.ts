import { Prisma } from '@prisma/client';
import prisma from '../../../lib/prisma';
export class AddressRepository {
  static async findAddressByIdAndCustomerId(
    tx: Prisma.TransactionClient,
    addressId: number,
    customerId: number,
  ) {
    return tx.address.findUnique({
      where: { id: addressId, customerId: customerId },
    });
  }
}
