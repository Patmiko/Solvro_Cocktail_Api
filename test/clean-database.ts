import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function cleanDatabase() {
  await prisma.rating.deleteMany();
  await prisma.cocktailIngredients.deleteMany();
  await prisma.emailAction.deleteMany();
  await prisma.ingredients.deleteMany();
  await prisma.ingredientType.deleteMany();
  await prisma.cocktailCategory.deleteMany();
  await prisma.cocktails.deleteMany();

  // finally delete users
  await prisma.user.deleteMany();
  const tablenames: { tablename: string }[] = await prisma.$queryRaw`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname='public'
  `;

  for (const { tablename } of tablenames) {
    if (tablename !== "_prisma_migrations") {
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE;`,
      );
    }
  }
}
