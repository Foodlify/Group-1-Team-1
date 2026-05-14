/*
  Warnings:

  - Added the required column `created_by` to the `OrderTracking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderTracking" ADD COLUMN     "created_by" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "OrderTracking" ADD CONSTRAINT "OrderTracking_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
