/*
  Warnings:

  - You are about to drop the `transactionStatusRef` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "transactionStatusRef";

-- CreateTable
CREATE TABLE "TransactionStatusRef" (
    "id" SERIAL NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "TransactionStatusRef_pkey" PRIMARY KEY ("id")
);
