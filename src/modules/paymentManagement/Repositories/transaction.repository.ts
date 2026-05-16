import prisma from '../../../../lib/prisma';
import { Prisma, TransactionStatusEnum } from '@prisma/client';

export class TransactionRepository {
  //Create Transaction with its tracking status record
  static async createTransaction(
    orderId: number,
    paymentId: number,
    sessionId: string,
    totalPrice: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    const statusId = await db.transactionStatus.findFirst({
      where: { status: TransactionStatusEnum.PENDING },
    });
    const result = await db.transaction.create({
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
    db: Prisma.TransactionClient = prisma,
  ) {
    const status = await db.transactionStatus.findFirst({
      where: { status: transactionStatus },
    });
    if (!status) throw new Error('Status not found');
    const transaction = await db.transaction.findFirst({
      where: {
        orderId,
        OR: [{ transactionNumber: sessionId }, { transactionNumber: null }],
      },
    });
    await db.transaction.update({
      where: { id: transaction!.id },
      data: { transactionStatusId: status.id },
    });
    await db.transactionStatusTracking.create({
      data: {
        transactionId: transaction!.id,
        status: transactionStatus,
      },
    });

    return transaction;
  }
}
