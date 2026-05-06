import { Prisma, TransactionStatusEnum } from '@prisma/client';
import { ENTITIES } from '../../../../prisma/entities';
import { NOT_FOUND } from '../../../shared_infrastructure/error/error.execption';
import { TransactionRepository } from '../Repositories/transaction.repository';

export class TransactionService {
  static async createTransaction(
    tx: Prisma.TransactionClient,
    orderId: number,
    paymentId: number,
    sessionId: string,
    totalPrice: number,
  ) {
    return await TransactionRepository.createTransaction(
      tx,
      orderId,
      paymentId,
      sessionId,
      totalPrice,
    );
  }
  static async updateTransaction(
    orderId: number,
    sessionId: string,
    transactionStatus: TransactionStatusEnum,
  ) {
    return await TransactionRepository.updateTransactionAndTracking(
      orderId,
      sessionId,
      transactionStatus,
    );
  }
}
