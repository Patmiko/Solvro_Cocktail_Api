import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { PrismaService } from "../prisma/prisma.service";
import type { CreateRatingDto } from "./dto/create-rating.dto";
import type { UpdateRatingDto } from "./dto/update-rating.dto";
import { RatingsService } from "./ratings.service";

describe("RatingsService", () => {
  let ratingsService: RatingsService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingsService,
        {
          provide: PrismaService,
          useValue: {
            rating: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    ratingsService = module.get<RatingsService>(RatingsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new rating", async () => {
      const createRatingDto: CreateRatingDto = { rating: 4 };
      const email = "user@example.com";
      const cocktailId = 1;

      prismaService.rating.findFirst.mockResolvedValue(null); // No existing rating
      prismaService.rating.create.mockResolvedValue({
        ...createRatingDto,
        userEmail: email,
        cocktailId,
      });

      const result = await ratingsService.create(
        createRatingDto,
        email,
        cocktailId,
      );

      expect(result).toEqual({
        ...createRatingDto,
        userEmail: email,
        cocktailId,
      });
      expect(prismaService.rating.create).toHaveBeenCalledWith({
        data: {
          rating: 4,
          user: { connect: { email } },
          cocktail: { connect: { id: cocktailId } },
        },
      });
    });

    it("should throw ConflictException if the rating already exists", async () => {
      const createRatingDto: CreateRatingDto = { rating: 4 };
      const email = "user@example.com";
      const cocktailId = 1;

      prismaService.rating.findFirst.mockResolvedValue({
        userEmail: email,
        cocktailId,
      }); // Rating already exists

      await expect(
        ratingsService.create(createRatingDto, email, cocktailId),
      ).rejects.toThrow(
        new ConflictException(
          "Rating for cocktail ID 1 by user user@example.com already exists",
        ),
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

      prismaService.rating.findMany.mockResolvedValue(ratings);

      const result = await ratingsService.findAll(cocktailId);

      expect(result).toEqual(ratings);
      expect(prismaService.rating.findMany).toHaveBeenCalledWith({
        where: { cocktailId },
        select: { userEmail: true, cocktailId: false, rating: true },
      });
    });
  });

  describe("findAllByUser", () => {
    it("should return all ratings for a user", async () => {
      const email = "user@example.com";
      const ratings = [
        { cocktailId: 1, rating: 4 },
        { cocktailId: 2, rating: 3 },
      ];

      prismaService.rating.findMany.mockResolvedValue(ratings);

      const result = await ratingsService.findAllByUser(email);

      expect(result).toEqual(ratings);
      expect(prismaService.rating.findMany).toHaveBeenCalledWith({
        where: { userEmail: email },
        select: { cocktailId: true, rating: true },
      });
    });
  });

  describe("findOne", () => {
    it("should return a specific rating", async () => {
      const email = "user@example.com";
      const cocktailId = 1;
      const rating = { userEmail: email, cocktailId, rating: 4 };

      prismaService.rating.findUnique.mockResolvedValue(rating);

      const result = await ratingsService.findOne(cocktailId, email);

      expect(result).toEqual(rating);
      expect(prismaService.rating.findUnique).toHaveBeenCalledWith({
        where: { userEmail_cocktailId: { cocktailId, userEmail: email } },
      });
    });

    it("should throw NotFoundException if rating not found", async () => {
      const email = "user@example.com";
      const cocktailId = 1;

      prismaService.rating.findUnique.mockResolvedValue(null); // No rating found

      await expect(ratingsService.findOne(cocktailId, email)).rejects.toThrow(
        new NotFoundException(
          "Rating for cocktail ID 1 by user user@example.com not found",
        ),
      );
    });
  });

  describe("update", () => {
    it("should update an existing rating", async () => {
      const email = "user@example.com";
      const cocktailId = 1;
      const updateRatingDto: UpdateRatingDto = { rating: 5 };
      const user = { email: "user@example.com", role: "USER" };
      const rating = { userEmail: email, cocktailId, rating: 4 };

      prismaService.rating.findFirst.mockResolvedValue(rating); // Rating exists
      prismaService.rating.update.mockResolvedValue({ ...rating, rating: 5 });

      const result = await ratingsService.update(
        cocktailId,
        updateRatingDto,
        email,
        user,
      );

      expect(result).toEqual({ ...rating, rating: 5 });
      expect(prismaService.rating.update).toHaveBeenCalledWith({
        where: { userEmail_cocktailId: { cocktailId, userEmail: email } },
        data: { rating: 5 },
      });
    });

    it("should throw NotFoundException if rating to update does not exist", async () => {
      const email = "user@example.com";
      const cocktailId = 1;
      const updateRatingDto: UpdateRatingDto = { rating: 5 };
      const user = { email: "user@example.com", role: "USER" };

      prismaService.rating.findFirst.mockResolvedValue(null); // No rating found

      await expect(
        ratingsService.update(cocktailId, updateRatingDto, email, user),
      ).rejects.toThrow(
        new NotFoundException(
          "Rating for cocktail ID 1 by user user@example.com not found",
        ),
      );
    });

    it("should throw UnauthorizedException if user is not the owner and not admin or moderator", async () => {
      const email = "user@example.com";
      const cocktailId = 1;
      const updateRatingDto: UpdateRatingDto = { rating: 5 };
      const user = { email: "another@example.com", role: "USER" };

      prismaService.rating.findFirst.mockResolvedValue({
        userEmail: email,
        cocktailId,
      }); // Rating exists

      await expect(
        ratingsService.update(cocktailId, updateRatingDto, email, user),
      ).rejects.toThrow(
        new UnauthorizedException(
          "You are not authorized to update this rating.",
        ),
      );
    });
  });

  describe("remove", () => {
    it("should delete a rating", async () => {
      const email = "user@example.com";
      const cocktailId = 1;
      const user = { email: "user@example.com", role: "USER" };

      prismaService.rating.findFirst.mockResolvedValue({
        userEmail: email,
        cocktailId,
      });
      prismaService.rating.delete.mockResolvedValue({
        userEmail: email,
        cocktailId,
      });

      const result = await ratingsService.remove(cocktailId, email, user);

      expect(result).toEqual({ userEmail: email, cocktailId });
      expect(prismaService.rating.delete).toHaveBeenCalledWith({
        where: { userEmail_cocktailId: { cocktailId, userEmail: email } },
      });
    });

    it("should throw NotFoundException if rating to delete does not exist", async () => {
      const email = "user@example.com";
      const cocktailId = 1;
      const user = { email: "user@example.com", role: "USER" };

      prismaService.rating.findFirst.mockResolvedValue(null); // No rating found

      await expect(
        ratingsService.remove(cocktailId, email, user),
      ).rejects.toThrow(
        new NotFoundException(
          "Rating for cocktail ID 1 by user user@example.com not found",
        ),
      );
    });

    it("should throw UnauthorizedException if user is not the owner and not admin or moderator", async () => {
      const email = "user@example.com";
      const cocktailId = 1;
      const user = { email: "another@example.com", role: "USER" };

      prismaService.rating.findFirst.mockResolvedValue({
        userEmail: email,
        cocktailId,
      }); // Rating exists

      await expect(
        ratingsService.remove(cocktailId, email, user),
      ).rejects.toThrow(
        new UnauthorizedException(
          "You are not authorized to delete this rating.",
        ),
      );
    });
  });
});
