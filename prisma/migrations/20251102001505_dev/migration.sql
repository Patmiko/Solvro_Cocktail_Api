-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'USER', 'MODERATOR');

-- CreateTable
CREATE TABLE "public"."User" (
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "about_me" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "is_enabled" BOOLEAN NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "public"."EmailAction" (
    "id" SERIAL NOT NULL,
    "userEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "lastSentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ingredients" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "alcoholic" BOOLEAN NOT NULL,
    "typeName" TEXT,
    "percantage" DOUBLE PRECISION,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IngredientType" (
    "name" TEXT NOT NULL,

    CONSTRAINT "IngredientType_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "public"."Cocktails" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "categoryName" TEXT,
    "glass" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cocktails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CocktailCategory" (
    "name" TEXT NOT NULL,

    CONSTRAINT "CocktailCategory_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "public"."Rating" (
    "id" SERIAL NOT NULL,
    "userEmail" TEXT NOT NULL,
    "cocktailId" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CocktailIngredients" (
    "cocktailId" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "amount" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "CocktailIngredients_pkey" PRIMARY KEY ("cocktailId","ingredientId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EmailAction_userEmail_action_key" ON "public"."EmailAction"("userEmail", "action");

-- CreateIndex
CREATE UNIQUE INDEX "Ingredients_name_key" ON "public"."Ingredients"("name");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientType_name_key" ON "public"."IngredientType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Cocktails_name_key" ON "public"."Cocktails"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CocktailCategory_name_key" ON "public"."CocktailCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_userEmail_cocktailId_key" ON "public"."Rating"("userEmail", "cocktailId");

-- AddForeignKey
ALTER TABLE "public"."EmailAction" ADD CONSTRAINT "EmailAction_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "public"."User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ingredients" ADD CONSTRAINT "Ingredients_typeName_fkey" FOREIGN KEY ("typeName") REFERENCES "public"."IngredientType"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cocktails" ADD CONSTRAINT "Cocktails_categoryName_fkey" FOREIGN KEY ("categoryName") REFERENCES "public"."CocktailCategory"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rating" ADD CONSTRAINT "Rating_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "public"."User"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rating" ADD CONSTRAINT "Rating_cocktailId_fkey" FOREIGN KEY ("cocktailId") REFERENCES "public"."Cocktails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CocktailIngredients" ADD CONSTRAINT "CocktailIngredients_cocktailId_fkey" FOREIGN KEY ("cocktailId") REFERENCES "public"."Cocktails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CocktailIngredients" ADD CONSTRAINT "CocktailIngredients_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "public"."Ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
