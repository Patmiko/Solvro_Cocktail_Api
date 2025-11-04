import { NotFoundException } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { CocktailCategoriesService } from "./cocktail-categories.service";

describe("CocktailCategoriesService", () => {
  let service: CocktailCategoriesService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = {
      cocktailCategory: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new CocktailCategoriesService(prisma);
  });

  describe("create", () => {
    it("should successfully create a cocktail category", async () => {
      const dto = { name: "Tropical", description: "Fruity drinks" };
      const created = { ...dto };
      prisma.cocktailCategory.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(prisma.cocktailCategory.create).toHaveBeenCalledTimes(1);
      expect(prisma.cocktailCategory.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(result).toEqual(created);
    });

    it("should propagate Prisma errors", async () => {
      prisma.cocktailCategory.create.mockRejectedValue(new Error("DB error"));
      await expect(service.create({ name: "Fail" })).rejects.toThrow(
        "DB error",
      );
    });
  });

  describe("findAll", () => {
    it("should return all cocktail categories", async () => {
      const mockCategories = [
        { name: "Classic", description: "Timeless cocktails" },
        { name: "Signature", description: "Custom creations" },
      ];
      prisma.cocktailCategory.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(prisma.cocktailCategory.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCategories);
    });

    it("should return an empty array when no categories exist", async () => {
      prisma.cocktailCategory.findMany.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return a category by name", async () => {
      const mockCategory = { name: "Modern", description: "Trendy drinks" };
      prisma.cocktailCategory.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findOne("Modern");

      expect(prisma.cocktailCategory.findUnique).toHaveBeenCalledWith({
        where: { name: "Modern" },
      });
      expect(result).toEqual(mockCategory);
    });

    it("should throw NotFoundException when category does not exist", async () => {
      prisma.cocktailCategory.findUnique.mockResolvedValue(null);

      await expect(service.findOne("Ghost")).rejects.toThrow(NotFoundException);
      await expect(service.findOne("Ghost")).rejects.toThrow(
        "Cocktail Category not found",
      );
    });
  });

  describe("update", () => {
    it("should update a category successfully", async () => {
      const mockExisting = { name: "Classic", description: "Old style" };
      const updateDto = { description: "Updated style" };
      const updated = { name: "Classic", description: "Updated style" };

      prisma.cocktailCategory.findFirst.mockResolvedValue(mockExisting);
      prisma.cocktailCategory.update.mockResolvedValue(updated);

      const result = await service.update("Classic", updateDto);

      expect(prisma.cocktailCategory.findFirst).toHaveBeenCalledWith({
        where: { name: "Classic" },
      });
      expect(prisma.cocktailCategory.update).toHaveBeenCalledWith({
        where: { name: "Classic" },
        data: updateDto,
      });
      expect(result).toEqual(updated);
    });

    it("should throw NotFoundException if category does not exist", async () => {
      prisma.cocktailCategory.findFirst.mockResolvedValue(null);
      await expect(service.update("Missing", {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should propagate Prisma errors during update", async () => {
      prisma.cocktailCategory.findFirst.mockResolvedValue({ name: "Classic" });
      prisma.cocktailCategory.update.mockRejectedValue(new Error("DB issue"));
      await expect(service.update("Classic", {})).rejects.toThrow("DB issue");
    });
  });

  describe("remove", () => {
    it("should delete a category successfully", async () => {
      const deleted = { name: "Tiki", description: "Removed" };
      prisma.cocktailCategory.delete.mockResolvedValue(deleted);

      const result = await service.remove("Tiki");

      expect(prisma.cocktailCategory.delete).toHaveBeenCalledWith({
        where: { name: "Tiki" },
      });
      expect(result).toEqual(deleted);
    });

    it("should throw NotFoundException if Prisma throws", async () => {
      prisma.cocktailCategory.delete.mockRejectedValue(
        new Error("Foreign key error"),
      );
      await expect(service.remove("NonExistent")).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove("NonExistent")).rejects.toThrow(
        "No Cocktail Category with this id could be deleted",
      );
    });
  });
});
