import prisma from '../../../lib/prisma';

export class CustomerRepository {
  static async findCustomerById(customerId: number) {
    return prisma.customer.findUnique({ where: { id: customerId } });
  }
}
