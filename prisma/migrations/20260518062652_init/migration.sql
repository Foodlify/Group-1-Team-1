/*
  Warnings:

  - A unique constraint covering the columns `[requestId]` on the table `SupportTicket` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SupportTicket_requestId_key" ON "SupportTicket"("requestId");
