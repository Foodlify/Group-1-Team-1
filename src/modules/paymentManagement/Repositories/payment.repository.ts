import prisma from '../../../../lib/prisma';
export class PaymentRepository {
  static async findPaymentTypeById(paymentTypeId: number) {
    return prisma.paymentIntegrationType.findUnique({
      where: { id: paymentTypeId },
    });
  }
}
