import bcrypt from "bcrypt";

import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { EmailService } from "../email/email.service";
import { UserService } from "../user/user.service";
import { AuthService } from "./auth.service";

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

describe("AuthService", () => {
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let emailService: jest.Mocked<EmailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
            createUser: jest.fn(),
            verifyUser: jest.fn(),
            changeUserPassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            signAsync: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendVerificationMail: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    emailService = module.get(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("signIn", () => {
    const email = "test@example.com";
    const password = "password123";
    const hashed = "hashed_pw";

    it("should sign in successfully with valid credentials", async () => {
      const user = {
        email,
        password: hashed,
        isEnabled: true,
        isVerified: true,
        role: "USER",
      };
      userService.findOne.mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue("jwt_token" as never);

      const result = await authService.signIn(email, password);

      expect(result).toEqual({ access_token: "jwt_token" });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        email: user.email,
        role: user.role,
      });
    });

    it("should throw UnauthorizedException if user not found", async () => {
      userService.findOne.mockResolvedValue(null);
      await expect(authService.signIn(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if user disabled", async () => {
      userService.findOne.mockResolvedValue({
        email,
        password: hashed,
        isEnabled: false,
        isVerified: true,
      } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(authService.signIn(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if password mismatch", async () => {
      userService.findOne.mockResolvedValue({
        email,
        password: hashed,
        isEnabled: true,
        isVerified: true,
      } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.signIn(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if user not verified", async () => {
      userService.findOne.mockResolvedValue({
        email,
        password: hashed,
        isEnabled: true,
        isVerified: false,
      } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(authService.signIn(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("signUp", () => {
    const registerDto = {
      email: "newuser@example.com",
      password: "secret",
      about_me: "hi",
      name: "new user",
    };

    it("should throw ConflictException if user already exists", async () => {
      userService.findOne.mockResolvedValue({
        email: registerDto.email,
      } as any);
      await expect(authService.signUp(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it("should create a new user, send email, and return success message", async () => {
      userService.findOne.mockResolvedValue(null);
      const createdUser = { email: registerDto.email };
      userService.createUser.mockResolvedValue(createdUser as any);
      jwtService.sign.mockReturnValue("token");
      emailService.sendVerificationMail.mockResolvedValue(undefined);

      process.env.FRONTEND_URL = "http://localhost:3000";

      const result = await authService.signUp(registerDto);

      expect(userService.createUser).toHaveBeenCalledWith({
        email: registerDto.email,
        password: registerDto.password,
        about_me: "hi",
        name: "new user",
      });

      expect(emailService.sendVerificationMail).toHaveBeenCalledWith(
        registerDto.email,
        "http://localhost:3000/auth/verify-email?token=token",
      );

      expect(result).toEqual({
        message:
          "The verification email has been sent to the provided email. Please check you mailbox",
      });
    });

    it("should handle missing optional fields gracefully", async () => {
      const dto = { email: "x@y.com", password: "pw" };
      userService.findOne.mockResolvedValue(null);
      const createdUser = { email: dto.email };
      userService.createUser.mockResolvedValue(createdUser as any);
      jwtService.sign.mockReturnValue("tkn");
      emailService.sendVerificationMail.mockResolvedValue(undefined);
      process.env.FRONTEND_URL = "https://testurl.com";

      const result = await authService.signUp(dto as any);
      expect(result.message).toContain("verification email");
      expect(emailService.sendVerificationMail).toHaveBeenCalled();
    });
  });

  describe("markVerified", () => {
    it("should call userService.verifyUser with correct email", async () => {
      await authService.markVerified("user@example.com");
      expect(userService.verifyUser).toHaveBeenCalledWith("user@example.com");
    });
  });

  describe("changePassword", () => {
    it("should call userService.changeUserPassword correctly", async () => {
      await authService.changePassword("user@example.com", "newpw");
      expect(userService.changeUserPassword).toHaveBeenCalledWith(
        "user@example.com",
        "newpw",
      );
    });
  });
});
