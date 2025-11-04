import path from "node:path";
import request from "supertest";

import type { INestApplication } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { cleanDatabase } from "./clean-database";
import { seedDatabase } from "./seed-database";

describe("CocktailIngredientsController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cocktail: any;
  let ingredient: any;
  let cocktailIngredient: any;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await cleanDatabase();
    await seedDatabase();

    prisma = app.get(PrismaService);

    const email = "Grzyb@gmail.com";
    const password = "password";

    const loginResult = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email, password });

    token = loginResult.body.access_token;

    const testImage = path.join(__dirname, "media", "test-image.png");

    const cocktailresult = await request(app.getHttpServer())
      .post("/cocktails")
      .set("Authorization", `Bearer ${token}`)
      .field("name", "Mojitotest")
      .field("description", "A refreshing rum cocktail with mint and lime.")
      .field("glass", "Highball")
      .field("instructions", "Mix ingredients and serve over ice.")
      .attach("image", String(testImage))
      .expect(201);

    cocktail = cocktailresult.body;

    const ingredientresult = await request(app.getHttpServer())
      .post("/ingredients")
      .set("Authorization", `Bearer ${token}`)
      .attach("image", String(testImage))
      .field("name", "Vodkatest")
      .field("type", "Juice")
      .field("alcoholic", "true")
      .expect(201);

    ingredient = ingredientresult.body;
  });

  afterAll(async () => {
    await prisma.cocktailIngredients.deleteMany({});
    await prisma.ingredients.deleteMany({});
    await prisma.cocktails.deleteMany({});
    await app.close();
  });

  it("POST /cocktails/:cocktailId/ingredients should create a cocktail ingredient", async () => {
    const result = await request(app.getHttpServer())
      .post(`/cocktails/${String(cocktail.id)}/ingredients`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        ingredientId: ingredient.id,
        amount: "40 ml",
      })
      .expect(201);

    expect(result.body).toHaveProperty("ingredientId", ingredient.id);
    expect(result.body.amount).toBe("40 ml");
    expect(result.body.cocktailId).toBe(cocktail.id);
    cocktailIngredient = result.body;
  });

  it("GET /cocktails/:cocktailId/ingredients should return all ingredients for a cocktail", async () => {
    const result = await request(app.getHttpServer())
      .get(`/cocktails/${String(cocktail.id)}/ingredients`)
      .expect(200);

    expect(Array.isArray(result.body)).toBe(true);
    expect(result.body.length).toBeGreaterThan(0);
  });

  it("GET /cocktails/:cocktailId/ingredients?filter=vod should filter ingredients by name", async () => {
    const result = await request(app.getHttpServer())
      .get(`/cocktails/${String(cocktail.id)}/ingredients?filter=vod`)
      .expect(200);

    expect(result.body[0].ingredient.name.toLowerCase()).toContain("vod");
  });

  it("GET /cocktails/:cocktailId/ingredients/:ingredientId should return single cocktail ingredient", async () => {
    const result = await request(app.getHttpServer())
      .get(
        `/cocktails/${String(cocktail.id)}/ingredients/${String(ingredient.id)}`,
      )
      .expect(200);

    expect(result.body.cocktailId).toBe(cocktail.id);
  });

  it("PATCH /cocktails/:cocktailId/ingredients/:ingredientId should update cocktail ingredient", async () => {
    const result = await request(app.getHttpServer())
      .patch(
        `/cocktails/${String(cocktail.id)}/ingredients/${String(ingredient.id)}`,
      )
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "50 ml",
      })
      .expect(200);

    expect(result.body.amount).toBe("50 ml");
  });

  it("DELETE /cocktails/:cocktailId/ingredients/:ingredientId should delete cocktail ingredient", async () => {
    await request(app.getHttpServer())
      .delete(
        `/cocktails/${String(cocktail.id)}/ingredients/${String(ingredient.id)}`,
      )
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    const found = await prisma.cocktailIngredients.findUnique({
      where: {
        cocktailId_ingredientId: {
          cocktailId: cocktail.id,
          ingredientId: ingredient.id,
        },
      },
    });
    expect(found).toBeNull();
  });
});
