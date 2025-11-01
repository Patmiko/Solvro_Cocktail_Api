/*
  Warnings:

  - You are about to drop the column `rating` on the `Cocktails` table. All the data in the column will be lost.
  - You are about to drop the column `votes` on the `Cocktails` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Cocktails" DROP COLUMN "rating",
DROP COLUMN "votes";

-- CreateTable
CREATE TABLE "public"."Rating" (
    "id" SERIAL NOT NULL,
    "userEmail" TEXT NOT NULL,
    "cocktailId" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rating_userEmail_cocktailId_key" ON "public"."Rating"("userEmail", "cocktailId");

-- AddForeignKey
ALTER TABLE "public"."Rating" ADD CONSTRAINT "Rating_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "public"."User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rating" ADD CONSTRAINT "Rating_cocktailId_fkey" FOREIGN KEY ("cocktailId") REFERENCES "public"."Cocktails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
