import { PaymentTypeEnum, Prisma } from '@prisma/client';

export interface OrderResponse {
  tx: Prisma.TransactionClient;
  customerId: number;
  paymentType?: { id: number; name: PaymentTypeEnum };
  address?: any;
  totalPrice?: number;
  cart?: any;
  order?: any;
  transaction?: any;
}
