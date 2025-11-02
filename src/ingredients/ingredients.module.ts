import { Module } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { IngredientsController } from './ingredients.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuthModule,PrismaModule],
  controllers: [IngredientsController],
  providers: [IngredientsService],
})
export class IngredientsModule {}
