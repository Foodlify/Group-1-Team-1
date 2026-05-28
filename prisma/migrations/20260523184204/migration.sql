/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `loyaltyPointsTransaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[customerId]` on the table `LoyaltyPoints` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderId]` on the table `LoyaltyPoints` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pointsId]` on the table `loyaltyPointsTransaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expiresAt` to the `LoyaltyPoints` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `LoyaltyPoints` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pointsId` to the `loyaltyPointsTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LoyaltyPoints" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "orderId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "loyaltyPointsTransaction" DROP COLUMN "expiresAt",
ADD COLUMN     "pointsId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyPoints_customerId_key" ON "LoyaltyPoints"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyPoints_orderId_key" ON "LoyaltyPoints"("orderId");

-- CreateIndex
CREATE INDEX "LoyaltyPoints_customerId_idx" ON "LoyaltyPoints"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "loyaltyPointsTransaction_pointsId_key" ON "loyaltyPointsTransaction"("pointsId");

-- AddForeignKey
ALTER TABLE "loyaltyPointsTransaction" ADD CONSTRAINT "loyaltyPointsTransaction_pointsId_fkey" FOREIGN KEY ("pointsId") REFERENCES "LoyaltyPoints"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
