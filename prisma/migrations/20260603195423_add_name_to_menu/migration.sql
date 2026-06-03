/*
  Warnings:

  - Added the required column `name` to the `Menu` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Menu" ADD COLUMN "name" TEXT NOT NULL DEFAULT 'Default Menu';
ALTER TABLE "Menu" ALTER COLUMN "name" DROP DEFAULT;
