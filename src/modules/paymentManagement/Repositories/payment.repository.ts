import { Prisma } from '@prisma/client';
import prisma from '../../../../lib/prisma';
export class PaymentRepository {
  static async findPaymentTypeById(
    paymentTypeId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return db.paymentIntegrationType.findUnique({
      where: { id: paymentTypeId },
    });
  }
}
