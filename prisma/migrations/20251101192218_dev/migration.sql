/*
  Warnings:

  - You are about to drop the column `category` on the `Cocktails` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Cocktails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Cocktails" DROP COLUMN "category",
ADD COLUMN     "categoryId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."CocktailCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CocktailCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CocktailCategory_name_key" ON "public"."CocktailCategory"("name");

-- AddForeignKey
ALTER TABLE "public"."Cocktails" ADD CONSTRAINT "Cocktails_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."CocktailCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
