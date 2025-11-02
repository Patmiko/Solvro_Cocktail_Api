// eslint-disable-next-line unicorn/import-style
import * as path from "node:path";

import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { ServeStaticModule } from "@nestjs/serve-static";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { CocktailCategoriesModule } from "./cocktail-categories/cocktail-categories.module";
import { CocktailIngredientsModule } from "./cocktail-ingredients/cocktail-ingredients.module";
import { CocktailsModule } from "./cocktails/cocktails.module";
import { IngredientTypesModule } from "./ingredient-types/ingredient-types.module";
import { IngredientsModule } from "./ingredients/ingredients.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RatingsModule } from "./ratings/ratings.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, "../..", "media"),
      serveRoot: "/media",
    }),
    AuthModule,
    UserModule,
    IngredientTypesModule,
    CocktailCategoriesModule,
    CocktailIngredientsModule,
    RatingsModule,
    CocktailsModule,
    IngredientsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
