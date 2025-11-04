import { NotFoundException } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { CocktailIngredientsService } from "../cocktail-ingredients/cocktail-ingredients.service";
import { PrismaService } from "../prisma/prisma.service";

describe("CocktailIngredientsService", () => {
  let service: CocktailIngredientsService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CocktailIngredientsService,
        {
          provide: PrismaService,
          useValue: {
            cocktailIngredients: {
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

    service = module.get<CocktailIngredientsService>(
      CocktailIngredientsService,
    );
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a cocktail ingredient", async () => {
    const dto = { ingredientId: 2, amount: "50ml" };
    const result = { cocktailId: 1, ingredientId: 2, amount: "50ml" };
    prisma.cocktailIngredients.create.mockResolvedValue(result);
    const response = await service.create(1, dto);
    expect(prisma.cocktailIngredients.create).toHaveBeenCalledWith({
      data: {
        cocktail: { connect: { id: 1 } },
        ingredient: { connect: { id: 2 } },
        amount: "50ml",
        note: "50ml",
      },
    });
    expect(response).toEqual(result);
  });

  it("should return all cocktail ingredients", async () => {
    const mockList = [{ cocktailId: 1, ingredientId: 2, amount: "50ml" }];
    prisma.cocktailIngredients.findMany.mockResolvedValue(mockList);
    const result = await service.findAll();
    expect(result).toEqual(mockList);
  });

  it("should return one cocktail ingredient", async () => {
    const mockItem = { cocktailId: 1, ingredientId: 2, amount: "50ml" };
    prisma.cocktailIngredients.findUnique.mockResolvedValue(mockItem);
    const result = await service.findOne(1, 2);
    expect(prisma.cocktailIngredients.findUnique).toHaveBeenCalledWith({
      where: { cocktailId_ingredientId: { cocktailId: 1, ingredientId: 2 } },
    });
    expect(result).toEqual(mockItem);
  });

  it("should throw NotFoundException if cocktail not found in findAllForCocktail", async () => {
    prisma.cocktailIngredients.findFirst.mockResolvedValue(null);
    await expect(service.findAllForCocktail(1, {})).rejects.toThrow(
      NotFoundException,
    );
  });

  it("should return ingredients for cocktail", async () => {
    prisma.cocktailIngredients.findFirst.mockResolvedValue({ cocktailId: 1 });
    const mockIngredients = [{ amount: "50ml", note: "test" }];
    prisma.cocktailIngredients.findMany.mockResolvedValue(mockIngredients);
    const result = await service.findAllForCocktail(1, {});
    expect(prisma.cocktailIngredients.findMany).toHaveBeenCalled();
    expect(result).toEqual(mockIngredients);
  });

  it("should update a cocktail ingredient", async () => {
    const dto = { amount: "60ml" };
    const updated = { cocktailId: 1, ingredientId: 2, amount: "60ml" };
    prisma.cocktailIngredients.update.mockResolvedValue(updated);
    const result = await service.update(1, 2, dto);
    expect(prisma.cocktailIngredients.update).toHaveBeenCalledWith({
      where: { cocktailId_ingredientId: { cocktailId: 1, ingredientId: 2 } },
      data: dto,
    });
    expect(result).toEqual(updated);
  });

  it("should remove a cocktail ingredient", async () => {
    const deleted = { cocktailId: 1, ingredientId: 2, amount: "50ml" };
    prisma.cocktailIngredients.delete.mockResolvedValue(deleted);
    const result = await service.remove(1, 2);
    expect(prisma.cocktailIngredients.delete).toHaveBeenCalledWith({
      where: { cocktailId_ingredientId: { cocktailId: 1, ingredientId: 2 } },
    });
    expect(result).toEqual(deleted);
  });
});
