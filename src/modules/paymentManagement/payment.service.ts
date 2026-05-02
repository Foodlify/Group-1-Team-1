import { ENTITIES } from '../../../prisma/entities';
import { NOT_FOUND } from '../../shared_infrastructure/error/error.execption';
import { PaymentRepository } from './payment.repository';

export class AddressService {
  static async getAdPaymentTypeById(paymentTypeId: number) {
      const paymentType = await PaymentRepository.findPaymentTypeById(
        paymentTypeId,
      );
      if (!paymentType) {
        throw new NOT_FOUND(ENTITIES.PAYMENT_INTEGRATION_TYPE);
      }
  }
}
