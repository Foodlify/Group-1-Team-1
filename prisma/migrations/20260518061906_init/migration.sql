/*
  Warnings:

  - The required column `requestId` was added to the `SupportTicket` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "SupportTicket" ADD COLUMN     "requestId" TEXT NOT NULL;
