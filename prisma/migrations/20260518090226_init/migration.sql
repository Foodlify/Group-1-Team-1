-- CreateEnum
CREATE TYPE "LoyaltyType" AS ENUM ('earn', 'redeem', 'expire');

-- CreateTable
CREATE TABLE "LoyaltyPoints" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LoyaltyPoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyaltyPointsTransaction" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "orderId" INTEGER,
    "type" "LoyaltyType" NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "loyaltyPointsTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "loyaltyPointsTransaction_orderId_key" ON "loyaltyPointsTransaction"("orderId");

-- AddForeignKey
ALTER TABLE "RestaurantRate" ADD CONSTRAINT "RestaurantRate_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyPoints" ADD CONSTRAINT "LoyaltyPoints_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyaltyPointsTransaction" ADD CONSTRAINT "loyaltyPointsTransaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyaltyPointsTransaction" ADD CONSTRAINT "loyaltyPointsTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
