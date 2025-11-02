/*
  Warnings:

  - You are about to drop the column `percantage` on the `Ingredients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Ingredients" DROP COLUMN "percantage",
ADD COLUMN     "percentage" DOUBLE PRECISION;
