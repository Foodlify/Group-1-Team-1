import { Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';
import { DbNull } from '@prisma/client/runtime/client';

export interface createAddressData{
  country: string,
  city: string, 
  street: string, 
  postalCode: string
}
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
  static async createAddress(
    customerId:number,
    data: createAddressData
  ){
    return await prisma.address.create({
      data: {
        ...data, 
        customerId, 
      },
    }); 
  }

}
