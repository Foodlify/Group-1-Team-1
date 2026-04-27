-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('cash', 'card', 'wallet', 'stripe', 'paypal');

-- CreateTable
CREATE TABLE "PaymentTypeRef" (
    "id" SERIAL NOT NULL,
    "name" "PaymentType" NOT NULL DEFAULT 'card',

    CONSTRAINT "PaymentTypeRef_pkey" PRIMARY KEY ("id")
);
