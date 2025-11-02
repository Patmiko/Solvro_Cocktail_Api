import request from "supertest";

import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";

import { AppModule } from "../src/app.module";
import { AuthService } from "../src/auth/auth.service";
import { EmailService } from "../src/email/email.service";
import { UserService } from "../src/user/user.service";
import { cleanDatabase } from "./clean-database";
import { seedDatabase } from "./seed-database";

jest.setTimeout(9999);

describe("AuthController (e2e)", () => {
  let app: INestApplication;
  let jwt: JwtService;
  let authService: AuthService;
  let userService: UserService;
  let emailService: EmailService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidUnknownValues: true }),
    );
    await app.init();

    jwt = moduleRef.get(JwtService);
    authService = moduleRef.get(AuthService);
    userService = moduleRef.get(UserService);
    emailService = moduleRef.get(EmailService);
  });

  beforeEach(async () => {
    await cleanDatabase();
    await seedDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  const testUser = {
    email: "Grzyb@gmail.com",
    password: "password",
  };

  describe("/auth/register (POST)", () => {
    it("should register a new user", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "Grzybtest@gmail.com",
          password: "password",
        })
        .expect(201);

      expect(res.body.message).toBe(
        "The verification email has been sent to the provided email. Please check you mailbox",
      );
    }, 9999);

    it("should fail if email already exists", async () => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .send(testUser)
        .expect(409);
    });
  });

  describe("/auth/login (POST)", () => {
    it("should log in with valid credentials", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send(testUser)
        .expect(200);

      expect(res.body).toHaveProperty("access_token");
    });

    it("should return 401 for invalid credentials", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: testUser.email, password: "wrong" })
        .expect(401);
    });
  });

  describe("/auth/profile (GET)", () => {
    it("should return 401 without token", async () => {
      await request(app.getHttpServer()).get("/auth/profile").expect(401);
    });

    it("should return profile with valid token", async () => {
      const token = jwt.sign({ sub: testUser.email });
      const res = await request(app.getHttpServer())
        .get("/auth/profile")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body).toBeDefined();
    });
  });

  describe("/auth/verify-email (GET)", () => {
    it("should verify email with valid token", async () => {
      const token = jwt.sign({ sub: testUser.email, purpose: "email-verify" });
      const res = await request(app.getHttpServer())
        .get(`/auth/verify-email?token=${token}`)
        .expect(200);

      expect(res.body.message).toBe("Email verified successfully");
    });

    it("should fail with invalid token", async () => {
      await request(app.getHttpServer())
        .get("/auth/verify-email?token=invalidtoken")
        .expect(400);
    });
  });

  describe("/auth/forgot-password (POST)", () => {
    it("should respond even if user does not exist", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/forgot-password")
        .send({ email: "fake@none.com" })
        .expect(200);

      expect(res.body.message).toContain("link has been sent");
    });
  });

  describe("/auth/reset-password (POST)", () => {
    it("should reset password with valid token", async () => {
      const token = jwt.sign({
        sub: testUser.email,
        purpose: "reset-password",
      });
      const res = await request(app.getHttpServer())
        .post("/auth/reset-password")
        .send({ token, newPassword: "NewPass123!" })
        .expect(200);

      expect(res.body.message).toBe("Password updated successfully");
    });

    it("should fail with invalid token", async () => {
      await request(app.getHttpServer())
        .post("/auth/reset-password")
        .send({ token: "invalid", newPassword: "abc123" })
        .expect(400);
    });
  });
});
