import { Prisma } from '@prisma/client';
import { ENTITIES } from '../../../../prisma/entities';
import { NOT_FOUND } from '../../../shared_infrastructure/error/error.execption';
import { PaymentRepository } from '../Repositories/payment.repository';
import prisma from '../../../../lib/prisma';
import loggerService from '../../../shared_infrastructure/logger/logger';

export class PaymentService {
  static async getPaymentTypeById(
    paymentTypeId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    loggerService.info('Fetching payment type', { paymentTypeId });

    const paymentType =
      await PaymentRepository.findPaymentTypeById(paymentTypeId, db);
    if (!paymentType) {
      loggerService.warn('Payment type not found', { paymentTypeId });
      throw new NOT_FOUND(ENTITIES.PAYMENT_INTEGRATION_TYPE);
    }

    loggerService.info('Payment type fetched', { paymentTypeId, name: paymentType.name });
    return paymentType;
  }
}
