import { Module } from '@nestjs/common';
import { CocktailCategoriesService } from './cocktail-categories.service';
import { CocktailCategoriesController } from './cocktail-categories.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CocktailCategoriesController],
  providers: [CocktailCategoriesService],
})
export class CocktailCategoriesModule {}
