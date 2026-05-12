import { Prisma } from '@prisma/client';
import prisma from '../../../lib/prisma';

export class CustomerRepository {
  static async findCustomerById(
    customerId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.customer.findUnique({ where: { id: customerId } });
  }
}
