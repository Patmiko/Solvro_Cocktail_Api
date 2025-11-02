import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

@Injectable()
export class IngredientsService {
  constructor(private prisma: PrismaService) {}
  async create(createIngredientDto: CreateIngredientDto, image: Express.Multer.File) {
    const { name, alcoholic, typeName, percentage } = createIngredientDto;
    let imageUrl: string;
    if (image === undefined) {
      throw new NotFoundException('Image file is required');
    }
    else {
      const mediaDirection = path.join(process.cwd(), 'media', 'ingredients');
      const filename = `${randomUUID()}.png`;
      const filePath = path.join(mediaDirection, filename);
      await fs.writeFile(filePath, image.buffer); 
      imageUrl = `/media/ingredients/${filename}`;
    }
    const ingredient = await this.prisma.ingredients.create({
      data: {
        name,
        alcoholic,
        typeName,
        percentage,
        imageUrl,
      },
    });
    return ingredient;
  }

  async findAll({type, alcoholic, name, sort, order}: {type?: string; alcoholic?: string; name?: string; sort?: string; order?: 'asc' | 'desc'} ) {
    const ingredients = await this.prisma.ingredients.findMany({
      where: {
        // To do Nulls should be last in sorting (treat them like 0)
        ...((name ?? "") && { name: { contains: name, mode: 'insensitive' } }),
        typeName: type,
        ...(alcoholic !== undefined && (alcoholic === 'true' ? { some :{alcoholic:true}} : { none: {alcoholic:true}})),
      },
      orderBy: sort ? { [sort]: order } : { createdAt: 'desc' },
    });
    return ingredients;
}

  async findOne(id: number) {
    const ingredient = await this.prisma.ingredients.findUnique({
      where: { id },
    });
    if (ingredient === null) {
      throw new NotFoundException(`Ingredient with ID ${String(id)} not found`);
    }
    return ingredient;
  }

  async update(id: number, updateIngredientDto: UpdateIngredientDto, image: Express.Multer.File) {
    const ingredient = await this.findOne(id);
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }
    let newFilePath: string = path.join(process.cwd(), "media","ingredients",`${randomUUID()}.png`);

    if (image) {
      const oldImagePath = path.join(process.cwd(), ingredient.imageUrl);

      try {
        await fs.unlink(oldImagePath);
      } catch (error) {
        if (error.code !== 'ENOENT') {console.error('Failed to delete old image:', error);}
      }

      const newFileName = `ingredient_${id}_${Date.now()}.jpg`;
      newFilePath = path.join('media', 'ingredients', newFileName);
      const absoluteNewFilePath = path.join(process.cwd(), newFilePath);

      await fs.writeFile(absoluteNewFilePath, image.buffer);

    }
    return await this.prisma.ingredients.update({
      where: { id },
      data: {...updateIngredientDto,
        imageUrl: newFilePath,
      },

    });
  }

  async remove(id: number) {
    const ingredient = await this.findOne(id);
    if (ingredient === null) {
      throw new NotFoundException(`Ingredient with ID ${String(id)} not found`);
    }
    const filePath = path.join(process.cwd(), ingredient.imageUrl);
    try {
    await fs.unlink(path.join(filePath)); // Delete image file
    } catch (error) {
      if (error.code !== 'ENOENT') {console.error('Failed to delete image:', error);}
    }
    return await this.prisma.ingredients.delete({
      where: { id },
    });
  }
}
