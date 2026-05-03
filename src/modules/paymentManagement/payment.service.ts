import { ENTITIES } from '../../../prisma/entities';
import { NOT_FOUND } from '../../shared_infrastructure/error/error.execption';
import { PaymentRepository } from './Repositories/payment.repository';

export class PaymentService {
  static async getPaymentTypeById(paymentTypeId: number) {
    return await PaymentRepository.findPaymentTypeById(paymentTypeId);
  }
}
