import path from "node:path";
import request from "supertest";

import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { AppModule } from "../src/app.module";
import { cleanDatabase } from "./clean-database";
import { seedDatabase } from "./seed-database";

jest.setTimeout(9999);

describe("CocktailsController (e2e)", () => {
  let app: INestApplication;
  let token: string;
  let cocktailId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();
    await cleanDatabase();
    await seedDatabase();

    const email = `Grzyb@gmail.com`;
    const password = "password";

    const loginRes = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email, password })
      .expect(200);

    token = loginRes.body.access_token;
  }, 9999);

  afterAll(async () => {
    await app.close();
  });

  describe("/cocktails (POST)", () => {
    it("should create a new cocktail", async () => {
      const testImage = path.join(__dirname, "media", "test-image.png");

      const res = await request(app.getHttpServer())
        .post("/cocktails")
        .set("Authorization", `Bearer ${token}`)
        .field("name", "Mojitotest")
        .field("description", "A refreshing rum cocktail with mint and lime.")
        .field("categoryName", "Tropical")
        .field("glass", "Highball")
        .field("instructions", "Mix ingredients and serve over ice.")
        .attach("image", testImage)
        .expect(201);

      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("name", "Mojitotest");
      cocktailId = res.body.id;
    }, 9999);
  });

  describe("/cocktails (GET)", () => {
    it("should return a list of cocktails", async () => {
      const res = await request(app.getHttpServer())
        .get("/cocktails")
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    }, 10000);
  });

  describe("/cocktails/:id (GET)", () => {
    it("should get one cocktail", async () => {
      const res = await request(app.getHttpServer())
        .get(`/cocktails/1`)
        .expect(200);

      expect(res.body).toHaveProperty("id", 1);
      expect(res.body).toHaveProperty("name");
    }, 9999);
  });

  describe("/cocktails/:id (PATCH)", () => {
    it("should update a cocktail", async () => {
      const res = await request(app.getHttpServer())
        .patch(`/cocktails/1`)
        .set("Authorization", `Bearer ${token}`)
        .field("name", "Updated Mojito")
        .expect(200);

      expect(res.body).toHaveProperty("name", "Updated Mojito");
    }, 9999);
  });

  describe("/cocktails/:id (DELETE)", () => {
    it("should delete a cocktail", async () => {
      const res = await request(app.getHttpServer())
        .delete(`/cocktails/2`)
        .set("Authorization", `Bearer ${token}`)
        .expect(204);
    }, 9999);
  });
});
