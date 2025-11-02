import request from "supertest";

import type { INestApplication } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("IngredientTypesController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  const apiPrefix = "/ingredients/types";

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
    await prisma.ingredientType.deleteMany({});
    await app.close();
  });

  describe(`${apiPrefix} (POST)`, () => {
    it("should create a new ingredient type", async () => {
      const res = await request(app.getHttpServer())
        .post(apiPrefix)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: "Spirittest" })
        .expect(201);

      expect(res.body).toHaveProperty("name", "Spirittest");
    }, 9999);

    it("should fail without authorization", async () => {
      await request(app.getHttpServer())
        .post(apiPrefix)
        .send({ name: "Juice" })
        .expect(401);
    });
  });

  describe(`${apiPrefix} (GET)`, () => {
    it("should return all ingredient types", async () => {
      const res = await request(app.getHttpServer()).get(apiPrefix).expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((t: any) => t.name === "Spirit")).toBe(true);
    });
  });

  describe(`${apiPrefix}/:name (GET)`, () => {
    it("should return a specific ingredient type", async () => {
      const res = await request(app.getHttpServer())
        .get(`${apiPrefix}/Spirit`)
        .expect(200);

      expect(res.body).toHaveProperty("name", "Spirit");
    });

    it("should return 404 for non-existent type", async () => {
      await request(app.getHttpServer())
        .get(`${apiPrefix}/UnknownType`)
        .expect(404);
    });
  });

  describe(`${apiPrefix}/:name (PATCH)`, () => {
    it("should update an existing ingredient type", async () => {
      const res = await request(app.getHttpServer())
        .patch(`${apiPrefix}/Spirit`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: "Liquor" })
        .expect(200);

      expect(res.body).toHaveProperty("name", "Liquor");
    });

    it("should return 404 if ingredient type not found", async () => {
      await request(app.getHttpServer())
        .patch(`${apiPrefix}/NotExisting`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: "Something" })
        .expect(404);
    });
  });

  describe(`${apiPrefix}/:name (DELETE)`, () => {
    it("should delete an ingredient type", async () => {
      await request(app.getHttpServer())
        .delete(`${apiPrefix}/Liquor`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      const check = await prisma.ingredientType.findUnique({
        where: { name: "Liquor" },
      });
      expect(check).toBeNull();
    });

    it("should return 404 if type not found", async () => {
      await request(app.getHttpServer())
        .delete(`${apiPrefix}/Nonexistent`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
