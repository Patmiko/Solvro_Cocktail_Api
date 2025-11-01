-- CreateTable
CREATE TABLE "public"."Ingredients" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "alcoholic" BOOLEAN NOT NULL,
    "typeId" INTEGER NOT NULL,
    "percantage" DOUBLE PRECISION,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IngredientType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "IngredientType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Cocktails" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "glass" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cocktails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CocktailIngredients" (
    "cocktailId" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "CocktailIngredients_pkey" PRIMARY KEY ("cocktailId","ingredientId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ingredients_name_key" ON "public"."Ingredients"("name");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientType_name_key" ON "public"."IngredientType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Cocktails_name_key" ON "public"."Cocktails"("name");

-- AddForeignKey
ALTER TABLE "public"."Ingredients" ADD CONSTRAINT "Ingredients_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "public"."IngredientType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CocktailIngredients" ADD CONSTRAINT "CocktailIngredients_cocktailId_fkey" FOREIGN KEY ("cocktailId") REFERENCES "public"."Cocktails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CocktailIngredients" ADD CONSTRAINT "CocktailIngredients_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "public"."Ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
