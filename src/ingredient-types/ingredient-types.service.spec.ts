import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { PrismaService } from "../prisma/prisma.service";
import { IngredientTypesService } from "./ingredient-types.service";

describe("IngredientTypesService", () => {
  let service: IngredientTypesService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngredientTypesService,
        {
          provide: PrismaService,
          useValue: {
            ingredientType: {
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

    service = module.get<IngredientTypesService>(IngredientTypesService);
    prisma = module.get(PrismaService);
  });

  describe("create", () => {
    it("should create a new ingredient type successfully", async () => {
      const dto = { name: "Juice" };
      const expected = { id: 1, ...dto };
      prisma.ingredientType.create.mockResolvedValue(expected);

      const result = await service.create(dto);
      expect(result).toEqual(expected);
      expect(prisma.ingredientType.create).toHaveBeenCalledWith({
        data: dto,
      });
    });

    it("should propagate any database error", async () => {
      prisma.ingredientType.create.mockRejectedValue(new Error("DB error"));
      await expect(service.create({ name: "Juice" })).rejects.toThrow(
        "DB error",
      );
    });
  });

  describe("findAll", () => {
    it("should return all ingredient types", async () => {
      const mockTypes = [
        { name: "Alcohol" },
        { name: "Juice" },
        { name: "Syrup" },
      ];
      prisma.ingredientType.findMany.mockResolvedValue(mockTypes);

      const result = await service.findAll();
      expect(result).toEqual(mockTypes);
      expect(prisma.ingredientType.findMany).toHaveBeenCalledTimes(1);
    });

    it("should return empty array if no ingredient types exist", async () => {
      prisma.ingredientType.findMany.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return a single ingredient type by name", async () => {
      const mockType = { name: "Alcohol" };
      prisma.ingredientType.findUnique.mockResolvedValue(mockType);

      const result = await service.findOne("Alcohol");
      expect(result).toEqual(mockType);
      expect(prisma.ingredientType.findUnique).toHaveBeenCalledWith({
        where: { name: "Alcohol" },
      });
    });

    it("should throw NotFoundException if ingredient type does not exist", async () => {
      prisma.ingredientType.findUnique.mockResolvedValue(null);

      await expect(service.findOne("Unknown")).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne("Unknown")).rejects.toThrow(
        "Ingredient type with name Unknown not found",
      );
    });
  });

  describe("update", () => {
    it("should update an existing ingredient type", async () => {
      const dto = { description: "Updated" };
      prisma.ingredientType.findFirst.mockResolvedValue({ name: "Juice" });
      prisma.ingredientType.update.mockResolvedValue({ name: "Juice", ...dto });

      const result = await service.update("Juice", dto);
      expect(result).toEqual({ name: "Juice", description: "Updated" });
      expect(prisma.ingredientType.update).toHaveBeenCalledWith({
        where: { name: "Juice" },
        data: dto,
      });
    });

    it("should throw NotFoundException if type does not exist", async () => {
      prisma.ingredientType.findFirst.mockResolvedValue(null);

      await expect(
        service.update("NonExistent", { description: "none" }),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update("NonExistent", { description: "none" }),
      ).rejects.toThrow("Ingredient type with this id doesnt exist");
    });

    it("should propagate unexpected database errors", async () => {
      prisma.ingredientType.findFirst.mockResolvedValue({ name: "Juice" });
      prisma.ingredientType.update.mockRejectedValue(new Error("DB error"));
      await expect(
        service.update("Juice", { description: "Updated" }),
      ).rejects.toThrow("DB error");
    });
  });

  describe("remove", () => {
    it("should delete an existing ingredient type", async () => {
      const mockDeleted = { name: "Juice" };
      prisma.ingredientType.delete.mockResolvedValue(mockDeleted);

      const result = await service.remove("Juice");
      expect(result).toEqual(mockDeleted);
      expect(prisma.ingredientType.delete).toHaveBeenCalledWith({
        where: { name: "Juice" },
      });
    });

    it("should throw NotFoundException if delete fails", async () => {
      prisma.ingredientType.delete.mockRejectedValue(
        new Error("Record not found"),
      );

      await expect(service.remove("NonExistent")).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove("NonExistent")).rejects.toThrow(
        "Ingredient type with this id doesnt exist",
      );
    });
  });
});
