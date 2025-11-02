import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "node:path";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { ScheduleModule } from '@nestjs/schedule';
import { RatingsModule } from './ratings/ratings.module';
import { CocktailIngredientsModule } from './cocktail-ingredients/cocktail-ingredients.module';
import { CocktailCategoriesModule } from './cocktail-categories/cocktail-categories.module';
import { CocktailsModule } from './cocktails/cocktails.module';
import { IngredientTypesModule } from './ingredient-types/ingredient-types.module';
import { IngredientsModule } from './ingredients/ingredients.module';


@Module({
  imports: [PrismaModule,
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath:join(__dirname,"../..","media"),
      serveRoot:"/media",
    }),
    AuthModule,
    UserModule,
    IngredientsModule,
    IngredientTypesModule,
    CocktailsModule,
    CocktailCategoriesModule,
    CocktailIngredientsModule,
    RatingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
