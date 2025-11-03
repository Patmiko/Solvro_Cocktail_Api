import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { CreateRatingDto } from "./dto/create-rating.dto";
import { UpdateRatingDto } from "./dto/update-rating.dto";

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createRatingDto: CreateRatingDto,
    email: string,
    cocktailId: number,
  ) {
    const clampedRating = Math.min(Math.max(createRatingDto.rating, 0), 5);
    const existing = await this.prisma.rating.findFirst({
      where: { userEmail: email, cocktailId },
    });
    if (existing !== null) {
      throw new ConflictException(
        `Rating for cocktail ID ${String(cocktailId)} by user ${email} already exists`,
      );
    }
    return await this.prisma.rating.create({
      data: {
        rating: clampedRating,
        user: {
          connect: { email },
        },
        cocktail: {
          connect: { id: cocktailId },
        },
      },
    });
  }

  async findAll(cocktailId: number) {
    return await this.prisma.rating.findMany({
      where: { cocktailId },
      select: {
        userEmail: true,
        cocktailId: false,
        rating: true,
      },
    });
  }

  async findAllByUser(email: string) {
    return await this.prisma.rating.findMany({
      where: { userEmail: email },
      select: {
        cocktailId: true,
        rating: true,
      },
    });
  }

  async findOne(cocktailId: number | string, userEmail: string) {
    const rating = await this.prisma.rating.findUnique({
      where: {
        userEmail_cocktailId: { cocktailId: Number(cocktailId), userEmail },
      },
    });
    if (!rating) {
      throw new NotFoundException(
        `Rating for cocktail ID ${String(cocktailId)} by user ${userEmail} not found`,
      );
    }
    return rating;
  }

  async update(
    cocktailId: number,
    updateRatingDto: UpdateRatingDto,
    userEmail: string,
    user: any,
  ) {
    const isOwner = user.email === userEmail;
    const rating = await this.prisma.rating.findFirst({
      where: { cocktailId: Number(cocktailId), userEmail },
    });

    if (!rating) {
      throw new NotFoundException(
        `Rating for cocktail ID ${String(cocktailId)} by user ${userEmail} not found`,
      );
    }
    if (!isOwner && user.role !== "ADMIN" && user.role !== "MODERATOR") {
      throw new UnauthorizedException(
        `You are not authorized to update this rating.`,
      );
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
    const rating = await this.prisma.rating.findFirst({
      where: { cocktailId: Number(cocktailId), userEmail },
    });
    const isOwner = user.email === userEmail;

    if (rating === null || rating === undefined) {
      throw new NotFoundException(
        `Rating for cocktail ID ${String(cocktailId)} by user ${userEmail} not found`,
      );
    }
    if (!isOwner && user.role !== "ADMIN" && user.role !== "MODERATOR") {
      throw new UnauthorizedException(
        `You are not authorized to delete this rating.`,
      );
    }
    try {
      const result = await this.prisma.rating.delete({
        where: { userEmail_cocktailId: { cocktailId, userEmail } },
      });
      return result;
    } catch {
      throw new NotFoundException("Rating with this id doesn't exist");
    }
  }
}
