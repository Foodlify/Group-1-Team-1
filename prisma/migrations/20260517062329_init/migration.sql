-- DropForeignKey
ALTER TABLE "OrderTracking" DROP CONSTRAINT "OrderTracking_created_by_fkey";

-- AlterTable
ALTER TABLE "OrderTracking" ALTER COLUMN "created_by" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "OrderTracking" ADD CONSTRAINT "OrderTracking_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
