import { Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';

export class CustomerRepository {
  static async findCustomerById(
    customerId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.customer.findUnique({ where: { id: customerId } });
  }

  static async findUserByEmail(
    email: string,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.user.findUnique({
      where: { email },
      include: { customer: true },
    });
  }

  static async findUserById(
    userId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.user.findUnique({
      where: { id: userId },
      include: { customer: true },
    });
  }

  static async findCustomerByPhone(
    phone: string,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.customer.findUnique({ where: { phone } });
  }

  static async createUserWithCustomer(
    userData: any,
    customerData: any,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.user.create({
      data: {
        ...userData,
        customer: {
          create: customerData,
        },
      },
      include: { customer: true },
    });
  }

  static async findUserWithCustomerById(
    userId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.user.findUnique({
      where: { id: userId },
      include: { customer: { include: { address: true } } },
    });
  }

  static async updateUserWithCustomer(
    userId: number,
    userData: { name?: string },
    customerData: { phone?: string; dob?: Date | null; gender?: string },
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.user.update({
      where: { id: userId },
      data: {
        ...userData,
        customer: { update: customerData },
      },
      include: { customer: { include: { address: true } } },
    });
  }
}
