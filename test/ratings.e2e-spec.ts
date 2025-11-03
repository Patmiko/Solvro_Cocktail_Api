import path from "node:path";
import request from "supertest";

import type { INestApplication } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { cleanDatabase } from "./clean-database";
import { seedDatabase } from "./seed-database";

jest.setTimeout(9999);

describe("RatingsController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let cocktailId: number;
  const baseUrl = "/cocktails";

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();
    await cleanDatabase();
    await seedDatabase();
    await prisma.rating.deleteMany();

    const email = "Grzyb@gmail.com";
    const password = "password";

    const loginRes = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email, password });

    token = loginRes.body.access_token;

    const testImage = path.join(__dirname, "media", "test-image.png");

    const res = await request(app.getHttpServer())
      .post("/cocktails")
      .set("Authorization", `Bearer ${token}`)
      .field("name", "Mojitotest")
      .field("description", "A refreshing rum cocktail with mint and lime.")
      .field("glass", "Highball")
      .field("instructions", "Mix ingredients and serve over ice.")
      .attach("image", testImage)
      .expect(201);
    cocktailId = res.body.id;
  }, 9999);

  afterAll(async () => {
    await app.close();
  });

  describe(`${baseUrl}/:cocktailId/ratings (POST)`, () => {
    it("should create a new rating for a cocktail", async () => {
      const res = await request(app.getHttpServer())
        .post(`${baseUrl}/${String(cocktailId)}/ratings`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 5 })
        .expect(201);
      expect(res.body).toHaveProperty("rating", 5);
    }, 9999);

    it("should not allow rating the same cocktail twice", async () => {
      await request(app.getHttpServer())
        .post(`${baseUrl}/4/ratings`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 4 })
        .expect(409);
    });

    it("should fail without authentication", async () => {
      await request(app.getHttpServer())
        .post(`${baseUrl}/${String(cocktailId)}/ratings`)
        .send({ rating: 4 })
        .expect(401);
    });
  });

  describe(`${baseUrl}/:cocktailId/ratings (GET)`, () => {
    it("should fetch all ratings for the cocktail", async () => {
      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/${cocktailId}/ratings`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe(`${baseUrl}/ratings/me (GET)`, () => {
    it("should get ratings made by the authenticated user", async () => {
      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/cocktails/ratings/me`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty("rating");
    });

    it("should fail without authentication", async () => {
      await request(app.getHttpServer())
        .get(`${baseUrl}/cocktails/ratings/me`)
        .expect(401);
    });
  });

  describe(`${baseUrl}/:cocktailId/ratings/:userEmail (GET)`, () => {
    it("should get a specific rating by cocktailId and userEmail", async () => {
      const res = await request(app.getHttpServer())
        .get(`${baseUrl}/${String(cocktailId)}/ratings/Grzyb@gmail.com`)
        .expect(200);

      expect(res.body).toHaveProperty("rating", 5);
    });

    it("should return 404 for non-existent rating", async () => {
      await request(app.getHttpServer())
        .get(`${baseUrl}/9999/ratings/nonexistent@example.com`)
        .expect(404);
    });
  });

  describe(`${baseUrl}/:cocktailId/ratings/:userEmail (PATCH)`, () => {
    it("should update the user’s rating", async () => {
      const res = await request(app.getHttpServer())
        .patch(`${baseUrl}/${String(cocktailId)}/ratings/Grzyb@gmail.com`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 3 })
        .expect(200);

      expect(res.body).toHaveProperty("rating", 3);
    });

    it("should return 404 if rating not found", async () => {
      await request(app.getHttpServer())
        .patch(`${baseUrl}/9999/ratings/nonexistent@example.com`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 2 })
        .expect(404);
    });
  });

  describe(`${baseUrl}/:cocktailId/ratings/:userEmail (DELETE)`, () => {
    it("should delete a rating", async () => {
      await request(app.getHttpServer())
        .delete(`${baseUrl}/${String(cocktailId)}/ratings/Grzyb@gmail.com`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      const deleted = await prisma.rating.findUnique({
        where: {
          userEmail_cocktailId: { cocktailId, userEmail: "Grzyb@gmail.com" },
        },
      });
      expect(deleted).toBeNull();
    });

    it("should return 404 if rating not found", async () => {
      await request(app.getHttpServer())
        .delete(`${baseUrl}/9999/ratings/Grzyb@gmail.com`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });
  });
});
