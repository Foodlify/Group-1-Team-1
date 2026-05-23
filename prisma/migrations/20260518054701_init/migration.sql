/*
  Warnings:

  - Made the column `assignedAgentId` on table `SupportTicket` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "SupportTicket" DROP CONSTRAINT "SupportTicket_assignedAgentId_fkey";

-- AlterTable
ALTER TABLE "SupportTicket" ALTER COLUMN "assignedAgentId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "CustomerServiceEmployee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
