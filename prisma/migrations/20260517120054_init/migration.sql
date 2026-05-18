/*
  Warnings:

  - Added the required column `assignedTickets` to the `CustomerServiceEmployee` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `section` on the `CustomerServiceEmployee` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "CustomerServiceEmployee" ADD COLUMN     "assignedTickets" INTEGER NOT NULL,
DROP COLUMN "section",
ADD COLUMN     "section" "TicketCategory" NOT NULL;
