 
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCocktailDto } from './dto/create-cocktail.dto';
import { UpdateCocktailDto } from './dto/update-cocktail.dto';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CocktailsService {
  constructor(private prisma: PrismaService) {}
  async create(createCocktailDto: CreateCocktailDto, image: Express.Multer.File) {
    let imageUrl: string;
    if (image === undefined) {
          throw new NotFoundException('Image file is required');
        }
    else {
          const mediaDirection = path.join(process.cwd(), 'media', 'cocktails');
          const filename = `${randomUUID()}.png`;
          const filePath = path.join(mediaDirection, filename);
          await fs.writeFile(filePath, image.buffer); 
          imageUrl = `/media/cocktails/${filename}`;
        }
    return await this.prisma.cocktails.create({
      data: {
        ...createCocktailDto,
        imageUrl,
      },
    });
  }

  async findAll(parameters: {
  sort?: string;
  order?: 'asc' | 'desc';
  name?: string;
  hasAlcohol?: string;
  ingredients?: string;
}) {
  const { sort, order, name, hasAlcohol, ingredients } = parameters;
  let ingredientList: string[] = [];

  if (ingredients !== undefined) {
    ingredientList = ingredients.split(',').map((ing) => ing.trim());
  }

  const cocktail = await this.prisma.cocktails.findMany({
    where: {
      ...((name ?? "") && { name: { contains: name, mode: 'insensitive' } }),
       ...(hasAlcohol !== undefined &&
    (hasAlcohol === 'true'
      ? {
          CocktailIngredients: {
            some: {
              ingredient: {
                alcoholic: true,
              },
            },
          },
        }
      : {
          // No alcoholic ingredients
          CocktailIngredients: {
            none: {
              ingredient: {
                alcoholic: true,
              },
            },
          },
        })),
      ...(ingredientList.length > 0 && {
        CocktailIngredients: {
          some: {
            ingredient: {
              name: { in: ingredientList, mode: 'insensitive' },
            },
          },
        },
      }),
    },
    orderBy: sort ? { [sort]: order } : { createdAt: 'desc' },
    include: {
      CocktailIngredients: {
        select: {
          amount: true,
          note: true,
          ingredient: {
            select: { id: true, name: true, imageUrl: true, type: true, alcoholic: true},
          },
        },
      },
    },
  });
  return cocktail;
}


  async findOne(id: number) {
  return await this.prisma.cocktails.findUnique({
    where: { id },
    include: {
      category: true,
      CocktailIngredients: {
        select: {
          amount: true,
          note: true,
          ingredient: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              type: true,
            },
          },
        },
      },
    },
  });
}


  async update(id: number, updateCocktailDto: UpdateCocktailDto, image: Express.Multer.File) {
    const cocktail = await this.findOne(id); // Ensure the cocktail exists
    const newFilePath: string = path.join("media","cocktails",randomUUID(),".png");
    if (cocktail === null) {
      throw new NotFoundException(`Cocktail with ID ${String(id)} not found`);
    }

    if (image !== undefined) {
          const mediaDirection = path.join(process.cwd(), cocktail.imageUrl);
          try {
          await fs.unlink(path.join(mediaDirection));
          } catch (error) {
            if (error.code !== 'ENOENT') {console.error('Failed to delete image:', error)
            ;}
          }
          await fs.writeFile(path.join(process.cwd(), newFilePath), image.buffer); 
        }
    
    return await this.prisma.cocktails.update({
      where: { id },
      data: {
        ...updateCocktailDto,
        imageUrl: image === undefined ? cocktail.imageUrl : `/${newFilePath}`,
      },
    });
  }

  async remove(id: number) {
    const cocktail = await this.findOne(id);
    if (cocktail === null) {
      throw new NotFoundException(`Cocktail with ID ${String(id)} not found`);
    }
    try {
    await fs.unlink(path.join(process.cwd(), cocktail.imageUrl));
    } catch (error) {
      if (error.code !== 'ENOENT') {console.error('Failed to delete image:', error);}
    }
    return await this.prisma.cocktails.delete({
      where: { id },
    });
  }
}
