import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard";
import { CocktailIngredientsService } from "./cocktail-ingredients.service";
import { CreateCocktailIngredientDto } from "./dto/create-cocktail-ingredient.dto";
import { UpdateCocktailIngredientDto } from "./dto/update-cocktail-ingredient.dto";

@ApiTags("Cocktail Ingredients")
@Controller("cocktails/:cocktailId/ingredients")
export class CocktailIngredientsController {
  constructor(
    private readonly cocktailIngredientsService: CocktailIngredientsService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a cocktail ingredient" })
  @ApiBody({ type: CreateCocktailIngredientDto })
  @ApiResponse({
    status: 201,
    description: "The cocktail ingredient has been successfully created.",
  })
  @ApiResponse({ status: 400, description: "Invalid input data." })
  @ApiParam({ name: "cocktailId", type: Number })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  async create(
    @Body() createCocktailIngredientDto: CreateCocktailIngredientDto,
    @Param("cocktailId") cocktailId: string,
  ) {
    return await this.cocktailIngredientsService.create(
      +cocktailId,
      createCocktailIngredientDto,
    );
  }

  @Get("")
  @ApiOperation({
    summary: "Get all of the Cocktail Ingredients for a given Cocktail",
  })
  @ApiParam({ name: "cocktailId", type: Number })
  @ApiResponse({ status: 200, description: "The cocktail ingredient." })
  @ApiResponse({ status: 404, description: "Cocktail ingredient not found." })
  @ApiQuery({
    name: "sort",
    required: false,
    description: "Field to sort by (e.g., percentage, createdAt, updatedAt)",
  })
  @ApiQuery({
    name: "order",
    required: false,
    description: "Sort order (asc or desc)",
    example: "asc",
  })
  @ApiQuery({
    name: "filter",
    required: false,
    description: "Filter by ingredient name (partial match)",
  })
  @ApiQuery({
    name: "alcoholic",
    required: false,
    description: "Filter by ingredient alcoholic content (true/false)",
  })
  async findAllForCocktail(
    @Param("cocktailId") cocktailId: string,
    @Query("sort") sort?: string,
    @Query("order") order: "asc" | "desc" = "asc",
    @Query("filter") filter?: string,
    @Query("alcoholic") alcoholic?: string,
  ) {
    return await this.cocktailIngredientsService.findAllForCocktail(
      +cocktailId,
      {
        sort,
        order,
        filter,
        alcoholic,
      },
    );
  }

  @Get(":ingredientId")
  @ApiOperation({ summary: "Get a cocktail ingredient by id" })
  @ApiParam({ name: "cocktailId", type: Number })
  @ApiParam({ name: "ingredientId", type: Number })
  @ApiResponse({ status: 200, description: "The cocktail ingredient." })
  @ApiResponse({ status: 404, description: "Cocktail ingredient not found." })
  async findOne(
    @Param("cocktailId") cocktailId: string,
    @Param("ingredientId") ingredientId: string,
  ) {
    return await this.cocktailIngredientsService.findOne(
      +cocktailId,
      +ingredientId,
    );
  }

  @Patch(":ingredientId")
  @ApiOperation({ summary: "Update a cocktail ingredient" })
  @ApiParam({ name: "cocktailId", type: Number })
  @ApiParam({ name: "ingredientId", type: Number })
  @ApiBody({ type: UpdateCocktailIngredientDto })
  @ApiResponse({
    status: 200,
    description: "The cocktail ingredient has been successfully updated.",
  })
  @ApiResponse({ status: 404, description: "Cocktail ingredient not found." })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  async update(
    @Param("cocktailId") cocktailId: string,
    @Param("ingredientId") ingredientId: string,
    @Body() updateCocktailIngredientDto: UpdateCocktailIngredientDto,
  ) {
    return await this.cocktailIngredientsService.update(
      +cocktailId,
      +ingredientId,
      updateCocktailIngredientDto,
    );
  }
  @Delete(":ingredientId")
  @ApiOperation({ summary: "Delete a cocktail ingredient" })
  @ApiParam({ name: "cocktailId", type: Number })
  @ApiParam({ name: "ingredientId", type: Number })
  @ApiResponse({
    status: 204,
    description: "The cocktail ingredient has been successfully deleted.",
  })
  @ApiResponse({ status: 404, description: "Cocktail ingredient not found." })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param("cocktailId") cocktailId: string,
    @Param("ingredientId") ingredientId: string,
  ) {
    await this.cocktailIngredientsService.remove(+cocktailId, +ingredientId);
  }
}
