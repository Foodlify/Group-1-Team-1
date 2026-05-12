import { Prisma } from '@prisma/client';
import { ENTITIES } from '../../../../prisma/entities';
import { NOT_FOUND } from '../../../shared_infrastructure/error/error.execption';
import { PaymentRepository } from '../Repositories/payment.repository';
import prisma from '../../../../lib/prisma';

export class PaymentService {
  static async getPaymentTypeById(
    paymentTypeId: number,
    db: Prisma.TransactionClient = prisma,
  ) {
    const paymentType =
      await PaymentRepository.findPaymentTypeById(paymentTypeId,db);
    if (!paymentType) throw new NOT_FOUND(ENTITIES.PAYMENT_INTEGRATION_TYPE);
    return paymentType;
  }
}
