import { Module } from '@nestjs/common';
import { IngredientTypesService } from './ingredient-types.service';
import { IngredientTypesController } from './ingredient-types.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RoleGuard } from '../auth/roles/role.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [IngredientTypesController],
  providers: [IngredientTypesService, RoleGuard],
})
export class IngredientTypesModule {}
