import { Injectable } from '@nestjs/common';
import { CreateCocktailCategoryDto } from './dto/create-cocktail-category.dto';
import { UpdateCocktailCategoryDto } from './dto/update-cocktail-category.dto';
import { PrismaService } from '../prisma/prisma.service';

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
    return await this.prisma.cocktailCategory.findUnique({
      where: { name },
    });
  }

  async update(name: string, updateCocktailCategoryDto: UpdateCocktailCategoryDto) {
    return await this.prisma.cocktailCategory.update({
      where: { name },
      data: updateCocktailCategoryDto,
    });
  }

  async remove(name: string) {
    return await this.prisma.cocktailCategory.delete({
      where: { name },
    });
  }
}
