/*
  Warnings:

  - The primary key for the `Rating` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `is_enabled` on the `User` table. All the data in the column will be lost.
  - Added the required column `isEnabled` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Rating_userEmail_cocktailId_key";

-- AlterTable
ALTER TABLE "public"."Rating" DROP CONSTRAINT "Rating_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Rating_pkey" PRIMARY KEY ("userEmail", "cocktailId");

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "is_enabled",
ADD COLUMN     "isEnabled" BOOLEAN NOT NULL;
