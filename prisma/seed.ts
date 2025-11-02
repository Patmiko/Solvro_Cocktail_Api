import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const main = async () => {
  // --- Cocktail Categories ---
const classic = await prisma.cocktailCategory.create({ data: { name: 'Classic' } });
const tropical = await prisma.cocktailCategory.create({ data: { name: 'Tropical' } });

  // --- Ingredient Types ---
  const spirit = await prisma.ingredientType.create({ data: { name: 'Spirit' } });
  const mixer = await prisma.ingredientType.create({ data: { name: 'Mixer' } });
  const juice = await prisma.ingredientType.create({ data: { name: 'Juice' } });
  const garnish = await prisma.ingredientType.create({ data: { name: 'Garnish' } });

  // --- Ingredients ---
  const vodka = await prisma.ingredients.create({
    data: {
      name: 'Vodka',
      alcoholic: true,
      typeName: spirit.name,
      percantage: 40,
      imageUrl: '/images/vodka.png',
    },
  });

  const rum = await prisma.ingredients.create({
    data: {
      name: 'White Rum',
      alcoholic: true,
      typeName: spirit.name,
      percantage: 37.5,
      imageUrl: '/images/white_rum.png',
    },
  });

  const limeJuice = await prisma.ingredients.create({
    data: {
      name: 'Lime Juice',
      alcoholic: false,
      typeName: juice.name,
      imageUrl: '/images/lime_juice.png',
    },
  });

  const sugarSyrup = await prisma.ingredients.create({
    data: {
      name: 'Sugar Syrup',
      alcoholic: false,
      typeName: mixer.name,
      imageUrl: '/images/sugar_syrup.png',
    },
  });

  const mintLeaves = await prisma.ingredients.create({
    data: {
      name: 'Mint Leaves',
      alcoholic: false,
      typeName: garnish.name,
      imageUrl: '/images/mint_leaves.png',
    },
  });

  const sodaWater = await prisma.ingredients.create({
    data: {
      name: 'Soda Water',
      alcoholic: false,
      typeName: mixer.name,
      imageUrl: '/images/soda_water.png',
    },
  });

  // --- Cocktails ---
  const mojito = await prisma.cocktails.create({
    data: {
      name: 'Mojito',
      instructions:
        'Muddle mint leaves with sugar syrup and lime juice. Add rum, ice, and top with soda water. Stir gently and garnish with mint.',
      imageUrl: '/images/mojito.png',
      categoryName: tropical.name,
      glass: 'Highball',
    },
  });

  const vodkaTonic = await prisma.cocktails.create({
    data: {
      name: 'Vodka Tonic',
      instructions:
        'Fill a glass with ice. Add vodka and top with tonic water. Stir gently and garnish with lime.',
      imageUrl: '/images/vodka_tonic.png',
      categoryName: classic.name,
      glass: 'Highball',
    },
  });

  // --- Cocktail Ingredients (join table) ---
  await prisma.cocktailIngredients.createMany({
    data: [
      // Mojito
      { cocktailId: mojito.id, ingredientId: rum.id, amount: " ml", note: '' },
      { cocktailId: mojito.id, ingredientId: limeJuice.id, amount: "25 ml", note: 'fresh' },
      { cocktailId: mojito.id, ingredientId: sugarSyrup.id, amount: "15 ml", note: '' },
      { cocktailId: mojito.id, ingredientId: mintLeaves.id, amount: "6 leaves", note: 'muddled' },
      { cocktailId: mojito.id, ingredientId: sodaWater.id, amount: "60 ml", note: 'top up' },

      // Vodka Tonic
      { cocktailId: vodkaTonic.id, ingredientId: vodka.id, amount: "50 ml", note: '' },
      { cocktailId: vodkaTonic.id, ingredientId: sodaWater.id, amount: "100 ml", note: 'or tonic water' },
      { cocktailId: vodkaTonic.id, ingredientId: limeJuice.id, amount: "10 ml", note: 'optional' },
    ],
  });
  const bc = await bcrypt.hash("password", 10);
  const User = await prisma.user.upsert({
    where: { email: "Marcin@wp.com" },
    update: {},
    create: {
      email: "Marcin@kghm.com",
      name: "Johnny Bravo",
      password: bc,
      is_enabled: true,
      role: "USER",
      isVerified:true
    },
  });

  const Admin = await prisma.user.upsert({
    where: { email: "Grzyb@gmail.com" },
    update: {},
    create: {
      email: "Grzyb@gmail.com",
      name: "Admin",
      password: bc, 
      is_enabled: true,
      role: "ADMIN",
      isVerified:true
    },
  });

  const Moderator = await prisma.user.upsert({
    where: { email: "Modo@gmail.com" },
    update: {},
    create: {
      email: "Modo@gmail.com",
      name: "Moderator",
      password: bc,
      is_enabled: true,
      role: "MODERATOR",
      isVerified:true
    },
  });

  // --- Ratings ---
  await prisma.rating.createMany({
    data: [
      { userEmail: Moderator.email, cocktailId: mojito.id, rating: 4.9 },
      { userEmail: Moderator.email, cocktailId: vodkaTonic.id, rating: 4 },
      { userEmail: Admin.email, cocktailId: mojito.id, rating: 4.2 },
      { userEmail: User.email, cocktailId: mojito.id, rating: 5 },
    ],
  });


  console.warn(User, "User created successfully");
  console.warn(Admin, "Admin created successfully");
  console.warn(Moderator, "Moderator created successfully");
  console.warn("Seed completed successfully");
};
main().catch((error: unknown) => {
  console.warn("Error While generating Seed: \n", error);
});
