import { promises as fs } from "node:fs";
import path from "node:path";

import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { PrismaService } from "../prisma/prisma.service";
import { IngredientsService } from "./ingredients.service";

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    ingredients: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

const prismaMock = {
  ingredients: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock("node:fs", () => ({
  promises: {
    writeFile: jest.fn(),
    unlink: jest.fn(),
  },
}));

describe("IngredientsService", () => {
  let service: IngredientsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngredientsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<IngredientsService>(IngredientsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new ingredient with image", async () => {
      const mockCreateIngredientDto = {
        name: "Test Ingredient",
        alcoholic: "true",
        typeName: "type",
        percentage: 40,
      };

      const mockImage = {
        buffer: Buffer.from("image-content"),
      } as Express.Multer.File;

      const mockIngredient = {
        id: 1,
        name: "Test Ingredient",
        alcoholic: true,
        typeName: "type",
        percentage: 40,
        imageUrl: "/media/ingredients/random-uuid.png",
      };

      prismaMock.ingredients.create.mockResolvedValue(mockIngredient);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const result = await service.create(mockCreateIngredientDto, mockImage);

      expect(prismaMock.ingredients.create).toHaveBeenCalledWith({
        data: {
          name: "Test Ingredient",
          alcoholic: true,
          typeName: "type",
          percentage: 40,
          imageUrl: expect.stringContaining(".png"),
        },
      });
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        mockImage.buffer,
      );
      expect(result).toEqual(mockIngredient);
    });

    it("should throw NotFoundException if no image is provided", async () => {
      const mockCreateIngredientDto = {
        name: "Test Ingredient",
        alcoholic: "true",
        typeName: "type",
        percentage: 40,
      };

      await expect(
        service.create(mockCreateIngredientDto, undefined as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("findOne", () => {
    it("should return the ingredient if found", async () => {
      const mockIngredient = {
        id: 1,
        name: "Test Ingredient",
        alcoholic: true,
        typeName: "type",
        percentage: 40,
        imageUrl: "/media/ingredients/random-uuid.png",
      };

      prismaMock.ingredients.findUnique.mockResolvedValue(mockIngredient);

      const result = await service.findOne(1);

      expect(prismaMock.ingredients.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockIngredient);
    });

    it("should throw NotFoundException if ingredient not found", async () => {
      prismaMock.ingredients.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update an ingredient and replace its image", async () => {
      const mockUpdateIngredientDto = {
        name: "Updated Ingredient",
        alcoholic: "false",
        typeName: "updated-type",
        percentage: 45,
      };

      const mockImage = {
        buffer: Buffer.from("updated-image-content"),
      } as Express.Multer.File;

      const mockIngredient = {
        id: 1,
        name: "Test Ingredient",
        alcoholic: true,
        typeName: "type",
        percentage: 40,
        imageUrl: "/media/ingredients/random-uuid.png",
      };

      const mockUpdatedIngredient = {
        ...mockIngredient,
        ...mockUpdateIngredientDto,
        imageUrl: "/media/ingredients/new-image.png",
      };

      prismaMock.ingredients.findUnique.mockResolvedValue(mockIngredient);
      prismaMock.ingredients.update.mockResolvedValue(mockUpdatedIngredient);
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const result = await service.update(
        1,
        mockUpdateIngredientDto,
        mockImage,
      );

      expect(prismaMock.ingredients.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          ...mockUpdateIngredientDto,
          imageUrl: expect.stringContaining(".png"),
        },
      });
      expect(fs.unlink).toHaveBeenCalledWith(
        path.join(process.cwd(), mockIngredient.imageUrl),
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        mockImage.buffer,
      );
      expect(result).toEqual(mockUpdatedIngredient);
    });

    it("should throw NotFoundException if ingredient not found", async () => {
      prismaMock.ingredients.findUnique.mockResolvedValue(null);

      await expect(service.update(999, {}, undefined as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("should remove the ingredient and its image", async () => {
      const mockIngredient = {
        id: 1,
        name: "Test Ingredient",
        alcoholic: true,
        typeName: "type",
        percentage: 40,
        imageUrl: "/media/ingredients/random-uuid.png",
      };

      prismaMock.ingredients.findUnique.mockResolvedValue(mockIngredient);
      prismaMock.ingredients.delete.mockResolvedValue(mockIngredient);
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      const result = await service.remove(1);

      expect(prismaMock.ingredients.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(fs.unlink).toHaveBeenCalledWith(
        path.join(process.cwd(), mockIngredient.imageUrl),
      );
      expect(result).toEqual(mockIngredient);
    });

    it("should throw NotFoundException if ingredient not found", async () => {
      prismaMock.ingredients.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
