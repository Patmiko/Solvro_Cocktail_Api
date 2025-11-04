import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { EmailService } from "../email/email.service";
import { UserService } from "../user/user.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signIn: jest.fn(),
            signUp: jest.fn(),
            markVerified: jest.fn(),
            changePassword: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
            sign: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendPasswordResetMail: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    emailService = module.get<EmailService>(EmailService);
  });

  describe("signIn", () => {
    const dto = { email: "test@example.com", password: "pass" };

    it("should return login response on success", async () => {
      const expected = { access_token: "token" };
      jest.spyOn(authService, "signIn").mockResolvedValue(expected);

      const result = await controller.signIn(dto);
      expect(result).toEqual(expected);
      expect(authService.signIn).toHaveBeenCalledWith(dto.email, dto.password);
    });
  });

  describe("signUp", () => {
    const dto = { email: "new@example.com", password: "1234" };

    it("should register user successfully", async () => {
      const expected = { message: "Verification sent" };
      jest.spyOn(authService, "signUp").mockResolvedValue(expected as any);

      const result = await controller.signUp(dto);
      expect(result).toEqual(expected);
      expect(authService.signUp).toHaveBeenCalledWith({
        email: dto.email,
        password: dto.password,
      });
    });

    it("should throw if AuthService throws", async () => {
      jest.spyOn(authService, "signUp").mockRejectedValue(new Error("fail"));

      await expect(controller.signUp(dto)).rejects.toThrow("fail");
    });
  });

  describe("getProfile", () => {
    it("should return user if request.user is present", () => {
      const mockReq = { user: { email: "a@b.com" } };
      const result = controller.getProfile(mockReq);
      expect(result).toEqual(mockReq.user);
    });

    it("should throw UnauthorizedException if user missing", () => {
      expect(() => controller.getProfile({})).toThrow(UnauthorizedException);
    });
  });

  describe("verify", () => {
    it("should verify user when valid token", async () => {
      const token = "token";
      const payload = { sub: "a@b.com", purpose: "email-verify" };
      jest.spyOn(jwtService, "verify").mockReturnValue(payload);
      jest.spyOn(authService, "markVerified").mockResolvedValue(undefined);

      const result = await controller.verify(token);
      expect(result).toEqual({ message: "Email verified successfully" });
      expect(authService.markVerified).toHaveBeenCalledWith(payload.sub);
    });

    it("should throw BadRequestException if purpose invalid", async () => {
      jest.spyOn(jwtService, "verify").mockReturnValue({ purpose: "wrong" });

      await expect(controller.verify("token")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException if verify fails", async () => {
      jest.spyOn(jwtService, "verify").mockImplementation(() => {
        throw new Error();
      });

      await expect(controller.verify("bad")).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("reset", () => {
    const dto = { token: "tok", newPassword: "newPass" };

    it("should reset password successfully", async () => {
      const payload = { sub: "a@b.com", purpose: "reset-password" };
      jest.spyOn(jwtService, "verify").mockReturnValue(payload);
      jest.spyOn(authService, "changePassword").mockResolvedValue(undefined);

      const result = await controller.reset(dto);
      expect(result).toEqual({ message: "Password updated successfully" });
      expect(authService.changePassword).toHaveBeenCalledWith(
        payload.sub,
        dto.newPassword,
      );
    });

    it("should throw BadRequestException for invalid purpose", async () => {
      jest.spyOn(jwtService, "verify").mockReturnValue({ purpose: "bad" });

      await expect(controller.reset(dto)).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException for expired token", async () => {
      jest.spyOn(jwtService, "verify").mockImplementation(() => {
        throw new Error();
      });

      await expect(controller.reset(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe("forgot", () => {
    const body = { email: "test@example.com" };

    it("should send email if user exists", async () => {
      const user = { email: "test@example.com" };
      jest.spyOn(userService, "findOne").mockResolvedValue(user as any);
      jest.spyOn(jwtService, "sign").mockReturnValue("jwt");
      jest.spyOn(emailService, "sendPasswordResetMail").mockResolvedValue();

      const result = await controller.forgot(body);
      expect(result).toEqual({
        message: "If that email exists, a link has been sent",
      });
      expect(emailService.sendPasswordResetMail).toHaveBeenCalled();
    });

    it("should still respond OK if user not found", async () => {
      jest.spyOn(userService, "findOne").mockResolvedValue(null);

      const result = await controller.forgot(body);
      expect(result).toEqual({ message: "link has been sent" });
    });
  });
});
