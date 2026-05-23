-- DropForeignKey
ALTER TABLE "RestaurantRate" DROP CONSTRAINT "RestaurantRate_orderId_fkey";

-- CreateIndex
CREATE INDEX "RestaurantRate_customerId_orderId_idx" ON "RestaurantRate"("customerId", "orderId");
