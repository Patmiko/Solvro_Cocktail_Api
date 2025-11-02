import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { CreateCocktailCategoryDto } from "./dto/create-cocktail-category.dto";
import { UpdateCocktailCategoryDto } from "./dto/update-cocktail-category.dto";

@Injectable()
export class CocktailCategoriesService {
  constructor(private prisma: PrismaService) {}
  async create(createCocktailCategoryDto: CreateCocktailCategoryDto) {
    return await this.prisma.cocktailCategory.create({
      data: createCocktailCategoryDto,
    });
  }

  async findAll() {
    return await this.prisma.cocktailCategory.findMany();
  }

  async findOne(name: string) {
    const result = await this.prisma.cocktailCategory.findUnique({
      where: { name },
    });
    if (result === null) {
      throw new NotFoundException("Cocktail Category not found");
    }
    return result;
  }

  async update(
    name: string,
    updateCocktailCategoryDto: UpdateCocktailCategoryDto,
  ) {
    const checkExists = await this.prisma.cocktailCategory.findFirst({
      where: { name },
    });
    if (checkExists === null) {
      throw new NotFoundException(
        "Cocktail Category with this id doesn't exist",
      );
    }
    return await this.prisma.cocktailCategory.update({
      where: { name },
      data: updateCocktailCategoryDto,
    });
  }

  async remove(name: string) {
    try {
      const result = await this.prisma.cocktailCategory.delete({
        where: { name },
      });
      return result;
    } catch {
      throw new NotFoundException(
        "No Cocktail Category with this id could be deleted",
      );
    }
  }
}
