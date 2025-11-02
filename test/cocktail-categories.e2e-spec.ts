import request from "supertest";

import type { INestApplication } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("CocktailCategoriesController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  const apiPrefix = "/cocktails/categories";

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();

    const email = "Grzyb@gmail.com";
    const password = "password";

    const res = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email, password });

    accessToken = res.body.access_token;
  }, 9999);

  afterAll(async () => {
    await prisma.cocktailCategory.deleteMany({});
    await app.close();
  });

  describe(`${apiPrefix} (POST)`, () => {
    it("should create a new cocktail category", async () => {
      const res = await request(app.getHttpServer())
        .post(apiPrefix)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: "Regular" })
        .expect(201);

      expect(res.body).toHaveProperty("name", "Regular");
    }, 9999);

    it("should fail without auth token", async () => {
      await request(app.getHttpServer())
        .post(apiPrefix)
        .send({ name: "Classic" })
        .expect(401);
    });
  });

  describe(`${apiPrefix} (GET)`, () => {
    it("should return all categories", async () => {
      const res = await request(app.getHttpServer()).get(apiPrefix).expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((cat: any) => cat.name === "Tropical")).toBe(true);
    });
  });

  describe(`${apiPrefix}/:name (GET)`, () => {
    it("should return a specific category by name", async () => {
      const res = await request(app.getHttpServer())
        .get(`${apiPrefix}/Tropical`)
        .expect(200);

      expect(res.body).toHaveProperty("name", "Tropical");
    });

    it("should return 404 for a non-existent category", async () => {
      await request(app.getHttpServer())
        .get(`${apiPrefix}/Nonexistent`)
        .expect(404);
    });
  });

  describe(`${apiPrefix}/:name (PATCH)`, () => {
    it("should update an existing category", async () => {
      const res = await request(app.getHttpServer())
        .patch(`${apiPrefix}/Tropical`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: "Summer Vibes" })
        .expect(200);

      expect(res.body).toHaveProperty("name", "Summer Vibes");
    });

    it("should return 404 if category not found", async () => {
      await request(app.getHttpServer())
        .patch(`${apiPrefix}/Unknown`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: "Something" })
        .expect(404);
    });
  });

  describe(`${apiPrefix}/:name (DELETE)`, () => {
    it("should delete a category", async () => {
      await request(app.getHttpServer())
        .delete(`${apiPrefix}/Summer Vibes`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      const check = await prisma.cocktailCategory.findUnique({
        where: { name: "Summer Vibes" },
      });
      expect(check).toBeNull();
    });

    it("should return 404 if category not found", async () => {
      await request(app.getHttpServer())
        .delete(`${apiPrefix}/Nonexistent`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
