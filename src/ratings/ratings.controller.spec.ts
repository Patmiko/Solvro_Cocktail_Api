import type { Request } from "express";

import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { AuthGuard } from "../auth/auth.guard";
import type { CreateRatingDto } from "./dto/create-rating.dto";
import type { UpdateRatingDto } from "./dto/update-rating.dto";
import { RatingsController } from "./ratings.controller";
import { RatingsService } from "./ratings.service";

describe("RatingsController", () => {
  let ratingsController: RatingsController;
  let ratingsService: jest.Mocked<RatingsService>;
  let mockRequest: Partial<Request>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RatingsController],
      providers: [
        {
          provide: RatingsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findAllByUser: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: AuthGuard,
          useValue: { canActivate: jest.fn(() => true) }, // Mocking AuthGuard
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    ratingsController = module.get<RatingsController>(RatingsController);
    ratingsService = module.get<RatingsService>(RatingsService);
    mockRequest = { user: { email: "user@example.com" } }; // Mock authenticated user
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new rating", async () => {
      const createRatingDto: CreateRatingDto = { rating: 4 };
      const cocktailId = 1;

      ratingsService.create.mockResolvedValue({
        ...createRatingDto,
        userEmail: "user@example.com",
        cocktailId,
      });

      const result = await ratingsController.create(
        createRatingDto,
        mockRequest as Request,
        cocktailId.toString(),
      );

      expect(result).toEqual({
        ...createRatingDto,
        userEmail: "user@example.com",
        cocktailId,
      });
      expect(ratingsService.create).toHaveBeenCalledWith(
        createRatingDto,
        "user@example.com",
        cocktailId,
      );
    });

    it("should throw ConflictException if rating already exists", async () => {
      const createRatingDto: CreateRatingDto = { rating: 4 };
      const cocktailId = 1;

      ratingsService.create.mockRejectedValue(
        new ConflictException("You have already rated this cocktail."),
      );

      await expect(
        ratingsController.create(
          createRatingDto,
          mockRequest as Request,
          cocktailId.toString(),
        ),
      ).rejects.toThrow(
        new ConflictException("You have already rated this cocktail."),
      );
    });
  });

  describe("findAll", () => {
    it("should return all ratings for a cocktail", async () => {
      const cocktailId = 1;
      const ratings = [
        { userEmail: "user1@example.com", rating: 4 },
        { userEmail: "user2@example.com", rating: 5 },
      ];

      ratingsService.findAll.mockResolvedValue(ratings);

      const result = await ratingsController.findAll(cocktailId.toString());

      expect(result).toEqual(ratings);
      expect(ratingsService.findAll).toHaveBeenCalledWith(cocktailId);
    });
  });

  describe("findAllByUser", () => {
    it("should return all ratings for the authenticated user", async () => {
      const ratings = [
        { cocktailId: 1, rating: 4 },
        { cocktailId: 2, rating: 5 },
      ];

      ratingsService.findAllByUser.mockResolvedValue(ratings);

      const result = await ratingsController.findAllByUser(
        mockRequest as Request,
      );

      expect(result).toEqual(ratings);
      expect(ratingsService.findAllByUser).toHaveBeenCalledWith(
        "user@example.com",
      );
    });
  });

  describe("findOne", () => {
    it("should return a specific rating for a cocktail and user", async () => {
      const cocktailId = 1;
      const userEmail = "user@example.com";
      const rating = { userEmail, cocktailId, rating: 4 };

      ratingsService.findOne.mockResolvedValue(rating);

      const result = await ratingsController.findOne(
        cocktailId.toString(),
        userEmail,
      );

      expect(result).toEqual(rating);
      expect(ratingsService.findOne).toHaveBeenCalledWith(
        cocktailId,
        userEmail,
      );
    });

    it("should throw NotFoundException if rating not found", async () => {
      const cocktailId = 1;
      const userEmail = "user@example.com";

      ratingsService.findOne.mockRejectedValue(
        new NotFoundException("Rating not found."),
      );

      await expect(
        ratingsController.findOne(cocktailId.toString(), userEmail),
      ).rejects.toThrow(new NotFoundException("Rating not found."));
    });
  });

  describe("update", () => {
    it("should update a rating", async () => {
      const cocktailId = 1;
      const userEmail = "user@example.com";
      const updateRatingDto: UpdateRatingDto = { rating: 5 };
      const updatedRating = { ...updateRatingDto, userEmail, cocktailId };

      ratingsService.update.mockResolvedValue(updatedRating);

      const result = await ratingsController.update(
        cocktailId.toString(),
        userEmail,
        updateRatingDto,
        mockRequest as Request,
      );

      expect(result).toEqual(updatedRating);
      expect(ratingsService.update).toHaveBeenCalledWith(
        cocktailId,
        updateRatingDto,
        userEmail,
        mockRequest.user,
      );
    });

    it("should throw NotFoundException if rating to update not found", async () => {
      const cocktailId = 1;
      const userEmail = "user@example.com";
      const updateRatingDto: UpdateRatingDto = { rating: 5 };

      ratingsService.update.mockRejectedValue(
        new NotFoundException("Rating not found."),
      );

      await expect(
        ratingsController.update(
          cocktailId.toString(),
          userEmail,
          updateRatingDto,
          mockRequest as Request,
        ),
      ).rejects.toThrow(new NotFoundException("Rating not found."));
    });

    it("should throw UnauthorizedException if user is not authorized to update", async () => {
      const cocktailId = 1;
      const userEmail = "user@example.com";
      const updateRatingDto: UpdateRatingDto = { rating: 5 };

      ratingsService.update.mockRejectedValue(
        new UnauthorizedException("Unauthorized to update this rating."),
      );

      await expect(
        ratingsController.update(
          cocktailId.toString(),
          userEmail,
          updateRatingDto,
          mockRequest as Request,
        ),
      ).rejects.toThrow(
        new UnauthorizedException("Unauthorized to update this rating."),
      );
    });
  });

  describe("remove", () => {
    it("should delete a rating", async () => {
      const cocktailId = 1;
      const userEmail = "user@example.com";

      ratingsService.remove.mockResolvedValue({ cocktailId, userEmail });

      const result = await ratingsController.remove(
        cocktailId.toString(),
        userEmail,
        mockRequest as Request,
      );

      expect(result).toEqual({ cocktailId, userEmail });
      expect(ratingsService.remove).toHaveBeenCalledWith(
        cocktailId,
        userEmail,
        mockRequest.user,
      );
    });

    it("should throw NotFoundException if rating to delete not found", async () => {
      const cocktailId = 1;
      const userEmail = "user@example.com";

      ratingsService.remove.mockRejectedValue(
        new NotFoundException("Rating not found."),
      );

      await expect(
        ratingsController.remove(
          cocktailId.toString(),
          userEmail,
          mockRequest as Request,
        ),
      ).rejects.toThrow(new NotFoundException("Rating not found."));
    });

    it("should throw UnauthorizedException if user is not authorized to delete", async () => {
      const cocktailId = 1;
      const userEmail = "user@example.com";

      ratingsService.remove.mockRejectedValue(
        new UnauthorizedException("Unauthorized to delete this rating."),
      );

      await expect(
        ratingsController.remove(
          cocktailId.toString(),
          userEmail,
          mockRequest as Request,
        ),
      ).rejects.toThrow(
        new UnauthorizedException("Unauthorized to delete this rating."),
      );
    });
  });
});
