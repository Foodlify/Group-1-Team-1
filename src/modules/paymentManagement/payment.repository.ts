import { Prisma } from '@prisma/client';
import prisma from '../../../lib/prisma';
export class PaymentRepository {
  static async findPaymentTypeById(
    tx: Prisma.TransactionClient,
    paymentTypeId: number,
  ) {
    return tx.menuItem.findUnique({
      where: { id: paymentTypeId },
    });
  }
}
