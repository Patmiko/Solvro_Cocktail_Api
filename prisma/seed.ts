import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const main = async () => {
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
      role: "Moderator",
      isVerified:true
    },
  });


  console.warn(User, "User created successfully");
  console.warn(Admin, "Admin created successfully");
  console.warn(Moderator, "Moderator created successfully");
  console.warn("Seed completed successfully");
};
main().catch((error: unknown) => {
  console.warn("Error While generating Seed: \n", error);
});
