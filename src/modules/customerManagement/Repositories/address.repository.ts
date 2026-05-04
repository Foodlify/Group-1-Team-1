import prisma from '../../../../lib/prisma';
export class AddressRepository {
  static async findAddressByIdAndCustomerId(
    addressId: number,
    customerId: number,
  ) {
    return await prisma.address.findUnique({
      where: {
        id_customerId: {
          id: addressId,
          customerId: customerId,
        },
      },
    });
  }
}
