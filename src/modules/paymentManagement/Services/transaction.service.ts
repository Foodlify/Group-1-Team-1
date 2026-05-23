import { Prisma, TransactionStatusEnum } from '@prisma/client';
import { TransactionRepository } from '../Repositories/transaction.repository';
import prisma from '../../../../lib/prisma';
import loggerService from '../../../shared_infrastructure/logger/logger';

export class TransactionService {
  static async createTransaction(
    orderId: number,
    paymentId: number,
    sessionId: string,
    totalPrice: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    loggerService.info('Creating transaction', { orderId, paymentId, totalPrice });

    const result = await TransactionRepository.createTransaction(
      orderId,
      paymentId,
      sessionId,
      totalPrice,
      db,
    );

    loggerService.info('Transaction created', { orderId, sessionId });
    return result;
  }

  static async updateTransaction(
    orderId: number,
    sessionId: string,
    transactionStatus: TransactionStatusEnum,
    db: Prisma.TransactionClient = prisma,
  ) {
    loggerService.info('Updating transaction', { orderId, sessionId, transactionStatus });

    const result = await TransactionRepository.updateTransactionAndTracking(
      orderId,
      sessionId,
      transactionStatus,
      db,
    );

    loggerService.info('Transaction updated', { orderId, sessionId, transactionStatus });
    return result;
  }
}
