/*
  Warnings:

  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Order";

-- DropTable
DROP TABLE "transaction";

-- CreateTable
CREATE TABLE "OrderStatusRef" (
    "id" SERIAL NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "OrderStatusRef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactionStatusRef" (
    "id" SERIAL NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "transactionStatusRef_pkey" PRIMARY KEY ("id")
);
