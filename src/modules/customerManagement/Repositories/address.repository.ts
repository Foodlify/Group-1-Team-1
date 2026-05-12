import { Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';
export class AddressRepository {
  static async findAddressByIdAndCustomerId(
    addressId: number,
    customerId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return await db.address.findUnique({
      where: {
        id_customerId: {
          id: addressId,
          customerId: customerId,
        },
      },
    });
  }
}
