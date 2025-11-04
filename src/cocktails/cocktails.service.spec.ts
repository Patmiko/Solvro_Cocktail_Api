import { promises as fs } from "node:fs";
import path from "node:path";

import { NotFoundException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { PrismaService } from "../prisma/prisma.service";
import { CocktailsService } from "./cocktails.service";

jest.mock("node:crypto", () => ({
  randomUUID: jest.fn(() => "mock-uuid"),
}));

const prismaMock = {
  cocktails: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe("CocktailsService", () => {
  let service: CocktailsService;

  let writeFileSpy: jest.SpyInstance;
  let unlinkSpy: jest.SpyInstance;

  beforeEach(async () => {
    writeFileSpy = jest
      .spyOn(fs, "writeFile")
      .mockResolvedValue(undefined as any);
    unlinkSpy = jest.spyOn(fs, "unlink").mockResolvedValue(undefined as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CocktailsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<CocktailsService>(CocktailsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    const mockCreateDto = {
      name: "Mojito",
      instructions: "Mix ingredients and serve chilled.",
      glass: "Highball",
      categoryName: "Cocktail",
    };

    it("should create a new cocktail with image", async () => {
      const mockFile = {
        buffer: Buffer.from("fake-image"),
      } as Express.Multer.File;
      const mockCreated = {
        id: 1,
        ...mockCreateDto,
        imageUrl: "/media/cocktails/mock-uuid.png",
      };

      prismaMock.cocktails.create.mockResolvedValue(mockCreated);
      writeFileSpy.mockResolvedValue(undefined);

      const result = await service.create(mockCreateDto, mockFile);

      expect(writeFileSpy).toHaveBeenCalledWith(
        expect.stringMatching(/mock-uuid\.png$/),
        mockFile.buffer,
      );

      expect(prismaMock.cocktails.create).toHaveBeenCalledWith({
        data: {
          name: "Mojito",
          instructions: "Mix ingredients and serve chilled.",
          glass: "Highball",
          imageUrl: "/media/cocktails/mock-uuid.png",
          category: {
            connectOrCreate: {
              where: { name: "Cocktail" },
              create: { name: "Cocktail" },
            },
          },
        },
      });
      expect(result).toEqual(mockCreated);
    });

    it("should throw if image is missing", async () => {
      await expect(
        service.create(mockCreateDto, undefined as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("findAll", () => {
    it("should return all cocktails without filters", async () => {
      const mockCocktails = [{ id: 1, name: "Mojito" }];
      prismaMock.cocktails.findMany.mockResolvedValue(mockCocktails);

      const result = await service.findAll({});
      expect(prismaMock.cocktails.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: "desc" },
        }),
      );
      expect(result).toEqual(mockCocktails);
    });

    it("should filter by name", async () => {
      const mockCocktails = [{ id: 2, name: "Gin Tonic" }];
      prismaMock.cocktails.findMany.mockResolvedValue(mockCocktails);

      const result = await service.findAll({ name: "gin" });
      expect(prismaMock.cocktails.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: { contains: "gin", mode: "insensitive" },
          }),
        }),
      );
      expect(result).toEqual(mockCocktails);
    });

    it("should filter by alcoholic ingredients", async () => {
      prismaMock.cocktails.findMany.mockResolvedValue([]);
      await service.findAll({ hasAlcohol: "true" });
      expect(prismaMock.cocktails.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            CocktailIngredients: expect.objectContaining({
              some: expect.any(Object),
            }),
          }),
        }),
      );
    });

    it("should filter by ingredient list", async () => {
      prismaMock.cocktails.findMany.mockResolvedValue([]);
      await service.findAll({ ingredients: "Gin, Lime Juice" });
      expect(prismaMock.cocktails.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            CocktailIngredients: expect.any(Object),
          }),
        }),
      );
    });

    it("should sort results if sort/order provided", async () => {
      prismaMock.cocktails.findMany.mockResolvedValue([]);
      await service.findAll({ sort: "name", order: "asc" });
      expect(prismaMock.cocktails.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: "asc" },
        }),
      );
    });
  });

  describe("findOne", () => {
    it("should return a cocktail by ID", async () => {
      const mockCocktail = { id: 1, name: "Margarita" };
      prismaMock.cocktails.findUnique.mockResolvedValue(mockCocktail);

      const result = await service.findOne(1);
      expect(prismaMock.cocktails.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockCocktail);
    });
  });

  describe("update", () => {
    const mockUpdateDto = {
      name: "Updated Mojito",
      instructions: "Updated instructions",
      glass: "Cocktail Glass",
    };

    it("should update cocktail and replace image", async () => {
      const mockCocktail = {
        id: 1,
        name: "Mojito",
        imageUrl: "/media/cocktails/old.png",
      };
      const mockFile = {
        buffer: Buffer.from("new-image"),
      } as Express.Multer.File;
      const mockUpdated = {
        ...mockCocktail,
        ...mockUpdateDto,
        imageUrl: "/media/cocktails/mock-uuid/.png",
      };

      jest.spyOn(service, "findOne").mockResolvedValue(mockCocktail);
      unlinkSpy.mockResolvedValue(undefined);
      writeFileSpy.mockResolvedValue(undefined);
      prismaMock.cocktails.update.mockResolvedValue(mockUpdated);

      const result = await service.update(1, mockUpdateDto, mockFile);

      expect(unlinkSpy).toHaveBeenCalled();
      expect(writeFileSpy).toHaveBeenCalled();
      expect(prismaMock.cocktails.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({
            name: "Updated Mojito",
            imageUrl: expect.stringMatching(/media[\\/]+cocktails/),
          }),
        }),
      );
      expect(result).toEqual(mockUpdated);
    });

    it("should throw if cocktail not found", async () => {
      jest.spyOn(service, "findOne").mockResolvedValue(null);
      await expect(
        service.update(999, mockUpdateDto, undefined as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should delete cocktail and its image", async () => {
      const mockCocktail = {
        id: 1,
        name: "Mojito",
        imageUrl: "/media/cocktails/mock.png",
      };
      jest.spyOn(service, "findOne").mockResolvedValue(mockCocktail);
      const unlinkSpy = jest
        .spyOn(fs, "unlink")
        .mockResolvedValue(undefined as any);
      prismaMock.cocktails.delete.mockResolvedValue(mockCocktail);

      const result = await service.remove(1);

      expect(unlinkSpy).toHaveBeenCalledWith(
        path.join(process.cwd(), mockCocktail.imageUrl),
      );
      expect(prismaMock.cocktails.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockCocktail);
    });

    it("should throw if cocktail not found", async () => {
      jest.spyOn(service, "findOne").mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it("should handle missing image file gracefully", async () => {
      const mockCocktail = {
        id: 1,
        name: "Mojito",
        imageUrl: "/media/cocktails/missing.png",
      };
      jest.spyOn(service, "findOne").mockResolvedValue(mockCocktail);

      const unlinkSpy = jest
        .spyOn(fs, "unlink")
        .mockRejectedValue({ code: "ENOENT" });
      prismaMock.cocktails.delete.mockResolvedValue(mockCocktail);

      const result = await service.remove(1);

      expect(unlinkSpy).toHaveBeenCalled();
      expect(prismaMock.cocktails.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockCocktail);
    });
  });
});
