import prisma from '../../../../lib/prisma';
import { Prisma, TransactionStatusEnum } from '@prisma/client';

export class TransactionRepository {
  static async createTransaction(
    orderId: number,
    paymentId: number,
    sessionId: string,
    totalPrice: number,
  ) {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const statusId = await tx.transactionStatus.findFirst({
        where: { status: TransactionStatusEnum.PENDING },
      });
      await tx.transaction.create({
        data: {
          orderId,
          transactionStatusId: statusId!.id,
          payTypeId: paymentId,
          transactionNumber: sessionId,
          amount: totalPrice,
          transactionStatusTracking: { create: { status: statusId!.status } },
        },
      });
    });
  }
  static async updateTransactionAndTracking(sessionId: string) {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const statusId = await tx.transactionStatus.findFirst({
        where: { status: TransactionStatusEnum.SUCCEEDED },
      });
      const transaction = await tx.transaction.update({
        where: { transactionNumber: sessionId },
        data: {
          transactionStatusId: statusId!.id,
        },
      });

      await tx.transactionStatusTracking.create({
        data: {
          transactionId: transaction.id,
          status: TransactionStatusEnum.SUCCEEDED,
        },
      });
    });
  }
}
