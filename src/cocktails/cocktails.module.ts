import { Module } from '@nestjs/common';
import { CocktailsService } from './cocktails.service';
import { CocktailsController } from './cocktails.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuthModule,PrismaModule],
  controllers: [CocktailsController],
  providers: [CocktailsService],
})
export class CocktailsModule {}
