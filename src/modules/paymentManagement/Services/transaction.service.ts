import { Prisma, TransactionStatusEnum } from '@prisma/client';
import { ENTITIES } from '../../../../prisma/entities';
import { NOT_FOUND } from '../../../shared_infrastructure/error/error.execption';
import { TransactionRepository } from '../Repositories/transaction.repository';
import prisma from '../../../../lib/prisma';

export class TransactionService {
  static async createTransaction(
    orderId: number,
    paymentId: number,
    sessionId: string,
    totalPrice: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    return await TransactionRepository.createTransaction(
      orderId,
      paymentId,
      sessionId,
      totalPrice,
      db
    );
  }
  static async updateTransaction(
    orderId: number,
    sessionId: string,
    transactionStatus: TransactionStatusEnum,
    db: Prisma.TransactionClient = prisma,
  ) {
    return await TransactionRepository.updateTransactionAndTracking(
      orderId,
      sessionId,
      transactionStatus,
      db
    );
  }
}
