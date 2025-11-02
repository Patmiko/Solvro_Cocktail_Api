import { Module } from '@nestjs/common';
import { CocktailIngredientsService } from './cocktail-ingredients.service';
import { CocktailIngredientsController } from './cocktail-ingredients.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule,PrismaModule],
  controllers: [CocktailIngredientsController],
  providers: [CocktailIngredientsService],
})
export class CocktailIngredientsModule {}
