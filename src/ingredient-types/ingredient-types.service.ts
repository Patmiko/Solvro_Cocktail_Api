import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateIngredientTypeDto } from './dto/create-ingredient-type.dto';
import { UpdateIngredientTypeDto } from './dto/update-ingredient-type.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IngredientTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createIngredientTypeDto: CreateIngredientTypeDto) {
    return await this.prisma.ingredientType.create({
      data: createIngredientTypeDto,
    });
  }

  async findAll() {
    return await this.prisma.ingredientType.findMany();
  }

  async findOne(name: string) {
    const type = await this.prisma.ingredientType.findUnique({
      where: { name },
    });
    if (type === null){
      throw new NotFoundException(`Ingredient type with name ${name} not found`);
    }
    return type;
  }

  async update(name: string, updateIngredientTypeDto: UpdateIngredientTypeDto) {
    return await this.prisma.ingredientType.update({
      where: { name },
      data: updateIngredientTypeDto,
    });
  }

  async remove(name: string) {
    return await this.prisma.ingredientType.delete({
      where: { name },
    });
  }
}
