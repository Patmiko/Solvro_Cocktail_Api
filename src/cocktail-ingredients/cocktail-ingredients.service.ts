/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCocktailIngredientDto } from './dto/create-cocktail-ingredient.dto';
import { UpdateCocktailIngredientDto } from './dto/update-cocktail-ingredient.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CocktailIngredientsService {
  constructor(private prisma: PrismaService) {}
  async create(createCocktailIngredientDto: CreateCocktailIngredientDto) {
    return await this.prisma.cocktailIngredients.create({
      data: {
        ...createCocktailIngredientDto,
      },
    });
  }

  async findAll() {
    return await this.prisma.cocktailIngredients.findMany();
  }

  async findOne(cocktailId: number,ingredientId: number) {
    return await this.prisma.cocktailIngredients.findUnique({
      where: { cocktailId_ingredientId: { cocktailId, ingredientId } },
    });
  }
  async findAllForCocktail(
  cocktailId: number,
  params: {
    sort?: string;
    order?: 'asc' | 'desc';
    filter?: string;
    alcoholic?: string;
  },
) {
  const checkCocktail = await this.prisma.cocktailIngredients.findFirst({
    where: { cocktailId },
  });
  if (checkCocktail === null) {
    throw new NotFoundException(`Cocktail with ID ${String(cocktailId)} not found`);
  }
  const ingredients = await this.prisma.cocktailIngredients.findMany({
    where: {
      cocktailId,
      ...((params.filter ?? "") && {
        ingredient: {
          name: { contains: params.filter, mode: 'insensitive' },
        },
      }),
      ...(params.alcoholic !== undefined && {
        ingredient: { alcoholic: params.alcoholic === 'true' },
      }),
    },
    orderBy: 
    (params.sort ?? "") && ['name', 'alcoholic', 'typeName', 'percentage', 'createdAt','updatedAt'].includes(params.sort ?? "createdAt")
        ? { ingredient: { [params.sort ?? "createdAt"]: params.order ?? 'asc' } }
        : { createdAt: 'asc' },
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

  async update(cocktailId: number,ingredientId: number, updateCocktailIngredientDto: UpdateCocktailIngredientDto) {
    return await this.prisma.cocktailIngredients.update({
      where: { cocktailId_ingredientId: { cocktailId, ingredientId } },
      data: { ...updateCocktailIngredientDto },
    });
  }

  async remove(cocktailId: number,ingredientId: number) {
    return await this.prisma.cocktailIngredients.delete({
      where: { cocktailId_ingredientId: { cocktailId, ingredientId } },
    });
  }
}
