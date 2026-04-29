/*
  Warnings:

  - You are about to drop the column `menuItemName` on the `OrderDetail` table. All the data in the column will be lost.
  - Added the required column `menu_item_name` to the `OrderDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderDetail" DROP COLUMN "menuItemName",
ADD COLUMN     "menu_item_name" TEXT NOT NULL;
