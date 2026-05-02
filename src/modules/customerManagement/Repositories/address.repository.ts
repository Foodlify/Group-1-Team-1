
import prisma from '../../../../lib/prisma';
export class AddressRepository {
  static async findAddressByIdAndCustomerId(
    addressId: number,
    customerId: number,
  ) {
    return prisma.address.findUnique({
      where: { id: addressId, customerId: customerId },
    });
  }
}
