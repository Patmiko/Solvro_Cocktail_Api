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

jest.setTimeout(9999); // extend timeout for longer E2E tests

describe("IngredientsController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let ingredientId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();

    await cleanDatabase();
    await seedDatabase();

    // create test user and login to get auth token
    const registerRes = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "Grzyb@gmail.com", password: "password" });

    token = registerRes.body.access_token;
  }, 9999);

  afterAll(async () => {
    await app.close();
  });

  describe("/ingredients (POST)", () => {
    it("should create a new ingredient", async () => {
      const testImage = path.join(__dirname, "media", "test-image.png");

      const res = await request(app.getHttpServer())
        .post("/ingredients")
        .set("Authorization", `Bearer ${token}`)
        .attach("image", testImage)
        .field("name", "Vodkatest")
        .field("type", "Juice")
        .field("alcoholic", true)
        .expect(201);

      ingredientId = res.body.id;
      expect(res.body).toHaveProperty("name", "Vodkatest");
    });
  });

  describe("/ingredients (GET)", () => {
    it("should return a list of ingredients", async () => {
      const res = await request(app.getHttpServer())
        .get("/ingredients")
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should support query filters", async () => {
      const res = await request(app.getHttpServer())
        .get("/ingredients")
        .query({ name: "Vodka" })
        .expect(200);

      expect(res.body[0]).toHaveProperty("name", "Vodkatest");
    });
  });

  describe("/ingredients/:id (GET)", () => {
    it("should get one ingredient", async () => {
      const res = await request(app.getHttpServer())
        .get(`/ingredients/1`)
        .expect(200);

      expect(res.body).toHaveProperty("id", 1);
    });
  });

  describe("/ingredients/:id (PATCH)", () => {
    it("should update an ingredient", async () => {
      const res = await request(app.getHttpServer())
        .patch(`/ingredients/1`)
        .set("Authorization", `Bearer ${token}`)
        .field("name", "Updated Vodka")
        .expect(200);

      expect(res.body).toHaveProperty("name", "Updated Vodka");
    });
  });

  describe("/ingredients/:id (DELETE)", () => {
    it("should delete an ingredient", async () => {
      const res = await request(app.getHttpServer())
        .delete(`/ingredients/2`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty("id", 2);
    });
  });
});
