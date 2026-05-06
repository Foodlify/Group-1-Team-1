import { ENTITIES } from '../../../../prisma/entities';
import { NOT_FOUND } from '../../../shared_infrastructure/error/error.execption';
import { PaymentRepository } from '../Repositories/payment.repository';

export class PaymentService {
  static async getPaymentTypeById(paymentTypeId: number) {
    const paymentType =
      await PaymentRepository.findPaymentTypeById(paymentTypeId);
    if (!paymentType) throw new NOT_FOUND(ENTITIES.PAYMENT_INTEGRATION_TYPE);
    return paymentType;
  }
}
