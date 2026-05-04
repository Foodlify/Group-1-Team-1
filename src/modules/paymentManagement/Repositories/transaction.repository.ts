import prisma from '../../../../lib/prisma';
import { Prisma, TransactionStatusEnum } from '@prisma/client';

export class TransactionRepository {
  //Create Transaction with its tracking status record
  static async createTransaction(
    tx: Prisma.TransactionClient,
    orderId: number,
    paymentId: number,
    sessionId: string,
    totalPrice: number,
  ) {
    const statusId = await tx.transactionStatus.findFirst({
      where: { status: TransactionStatusEnum.PENDING },
    });
    const result = await tx.transaction.create({
      data: {
        orderId,
        transactionStatusId: statusId!.id,
        payTypeId: paymentId,
        transactionNumber: sessionId,
        amount: totalPrice,
        tracking: { create: { status: statusId!.status } },
      },
      include: { tracking: true },
    });
    return result;
  }
  static async updateTransactionAndTracking(
    orderId: number,
    sessionId: string | null,
    transactionStatus: TransactionStatusEnum,
  ) {
    return await prisma.$transaction(async (tx) => {
      const status = await tx.transactionStatus.findFirst({
        where: { status: transactionStatus },
      });
      if (!status) throw new Error('Status not found');
      const transaction = await prisma.transaction.findFirst({
        where: {
          orderId,
          OR: [{ transactionNumber: sessionId }, { transactionNumber: null }],
        },
      });
      await prisma.transaction.update({
        where: { id: transaction!.id },
        data: { transactionStatusId: status.id },
      });
      await tx.transactionStatusTracking.create({
        data: {
          transactionId: transaction!.id,
          status: transactionStatus,
        },
      });

      return transaction;
    });
  }
}
