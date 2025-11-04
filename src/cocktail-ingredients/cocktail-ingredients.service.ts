import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { CreateCocktailIngredientDto } from "./dto/create-cocktail-ingredient.dto";
import { UpdateCocktailIngredientDto } from "./dto/update-cocktail-ingredient.dto";

@Injectable()
export class CocktailIngredientsService {
  constructor(private prisma: PrismaService) {}
  async create(
    cocktailId: number,
    createCocktailIngredientDto: CreateCocktailIngredientDto,
  ) {
    return await this.prisma.cocktailIngredients.create({
      data: {
        cocktail: {
          connect: { id: cocktailId },
        },
        ingredient: {
          connect: { id: createCocktailIngredientDto.ingredientId },
        },
        amount: createCocktailIngredientDto.amount,
        note: createCocktailIngredientDto.amount,
      },
    });
  }

  async findAll() {
    return await this.prisma.cocktailIngredients.findMany();
  }

  async findOne(cocktailId: number, ingredientId: number) {
    return await this.prisma.cocktailIngredients.findUnique({
      where: { cocktailId_ingredientId: { cocktailId, ingredientId } },
    });
  }
  async findAllForCocktail(
    cocktailId: number,
    parameters: {
      sort?: string;
      order?: "asc" | "desc";
      filter?: string;
      alcoholic?: string;
    },
  ) {
    const checkCocktail = await this.prisma.cocktailIngredients.findFirst({
      where: { cocktailId },
    });
    if (checkCocktail === null) {
      throw new NotFoundException(
        `Cocktail with ID ${String(cocktailId)} not found`,
      );
    }
    const ingredients = await this.prisma.cocktailIngredients.findMany({
      where: {
        cocktailId,
        ...((parameters.filter ?? "") && {
          ingredient: {
            name: { contains: parameters.filter, mode: "insensitive" },
          },
        }),
        ...(parameters.alcoholic !== undefined && {
          ingredient: { alcoholic: parameters.alcoholic === "true" },
        }),
      },
      orderBy:
        (parameters.sort ?? "") &&
        [
          "name",
          "alcoholic",
          "typeName",
          "percentage",
          "createdAt",
          "updatedAt",
        ].includes(parameters.sort ?? "createdAt")
          ? {
              ingredient: {
                [parameters.sort ?? "createdAt"]: parameters.order ?? "asc",
              },
            }
          : { createdAt: "asc" },
      select: {
        amount: true,
        note: true,
        ingredient: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            typeName: true,
            alcoholic: true,
            percentage: true,
          },
        },
      },
    });
    return ingredients;
  }

  async update(
    cocktailId: number,
    ingredientId: number,
    updateCocktailIngredientDto: UpdateCocktailIngredientDto,
  ) {
    return await this.prisma.cocktailIngredients.update({
      where: { cocktailId_ingredientId: { cocktailId, ingredientId } },
      data: { ...updateCocktailIngredientDto },
    });
  }

  async remove(cocktailId: number, ingredientId: number) {
    return await this.prisma.cocktailIngredients.delete({
      where: { cocktailId_ingredientId: { cocktailId, ingredientId } },
    });
  }
}
