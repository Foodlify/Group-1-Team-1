import { Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';

type CustomerWithUser    = Prisma.CustomerGetPayload<{ include: { user: true } }>;
type CustomerWithoutUser = Prisma.CustomerGetPayload<{}>;

export class CustomerRepository {
  static async findCustomerById(
    customerId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.customer.findUnique({ where: { id: customerId } });
  }

  static findCustomerByUserId(userId: number, includeUser: true,           db?: Prisma.TransactionClient): Promise<CustomerWithUser    | null>;
  static findCustomerByUserId(userId: number, includeUser?: false,         db?: Prisma.TransactionClient): Promise<CustomerWithoutUser | null>;
  static async findCustomerByUserId(userId: number, includeUser = false, db: Prisma.TransactionClient = prisma) {
    return db.customer.findUnique({
      where:   { userId },
      ...(includeUser && { include: { user: true } }),
    });
  }

  static async findCustomerByPhone(
    phone: string,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.customer.findUnique({ where: { phone } });
  }

  static async createCustomer(
    userId: number,
    data: { phone: string; dob?: Date | null; gender?: string | null },
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.customer.create({ data: { userId, ...data } });
  }

  static async updateCustomer(
    userId: number,
    data: { phone?: string; dob?: Date | null; gender?: string },
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.customer.update({ where: { userId }, data });
  }
}
