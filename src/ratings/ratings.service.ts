import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RatingsService {
  constructor(private prisma : PrismaService) {}

  async create(createRatingDto: CreateRatingDto, email: string, cocktailId: number) {
  try {
    const clampedRating = Math.min(Math.max(createRatingDto.rating, 0), 5);

    return await this.prisma.rating.create({
      data: {
        userEmail: email,
        cocktailId,
        rating: clampedRating,
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ConflictException('You have already rated this cocktail.');
    }
    throw error;
  }
}

  async findAll(cocktailId: number) {
    return await this.prisma.rating.findMany({
      where: { cocktailId },
      select: {
        userEmail: true,
        cocktailId: false,
        rating: true,
      },
    }
    );
  }

  async findAllByUser(email: string) {
    return await this.prisma.rating.findMany({
      where: { userEmail: email },
      select: {
        cocktailId: true,
        rating: true,
      },
    }
    );
  }

  async findOne(cocktailId: number, userEmail: string) {
    const rating = await this.prisma.rating.findUnique({
      where: { userEmail_cocktailId: { cocktailId, userEmail } },
    });
    if (rating === null || rating === undefined) {
      throw new NotFoundException(`Rating for cocktail ID ${String(cocktailId)} by user ${userEmail} not found`);
    }
    return rating;
  }

  async update(cocktailId: number, updateRatingDto: UpdateRatingDto, userEmail: string, user: any) {
    const isOwner = user.email === userEmail;
    const rating = this.findOne(cocktailId, userEmail);

    if (rating === null || rating === undefined) {
      throw new NotFoundException(`Rating for cocktail ID ${String(cocktailId)} by user ${userEmail} not found`);
    }
    if (!isOwner) {
      throw new UnauthorizedException(`You are not authorized to update this rating.`);
    }
    const clampedRating = Math.min(Math.max(updateRatingDto.rating ?? 0, 0), 5);
    return this.prisma.rating.update({
      where: { userEmail_cocktailId: { cocktailId, userEmail } },
      data: {
        rating: clampedRating,
      },
    });
  }

  async remove(cocktailId: number, userEmail: string, user: any) {
    const rating = this.findOne(cocktailId, userEmail);
    const isOwner = user.email === userEmail;

    if (rating === null || rating === undefined) {
      throw new NotFoundException(`Rating for cocktail ID ${String(cocktailId)} by user ${userEmail} not found`);
    }
    if (!isOwner && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      throw new UnauthorizedException(`You are not authorized to delete this rating.`);
    }
    return this.prisma.rating.delete({
      where: { userEmail_cocktailId: { cocktailId, userEmail } },
    });
  }
}
