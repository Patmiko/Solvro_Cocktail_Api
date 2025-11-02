import { Injectable } from '@nestjs/common';
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
  async findAllForCocktail(cocktailId: number) {
    return await this.prisma.cocktailIngredients.findMany({
      where: { cocktailId },
      select: {
        ingredient: true,
        amount: true,
        note: true,
      },
    });
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
