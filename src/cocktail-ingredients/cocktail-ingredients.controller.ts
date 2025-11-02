import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CocktailIngredientsService } from './cocktail-ingredients.service';
import { CreateCocktailIngredientDto } from './dto/create-cocktail-ingredient.dto';
import { UpdateCocktailIngredientDto } from './dto/update-cocktail-ingredient.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Cocktail Ingredients')
@Controller('cocktails/:cocktailId/ingredients')
export class CocktailIngredientsController {
  constructor(private readonly cocktailIngredientsService: CocktailIngredientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a cocktail ingredient' })
  @ApiBody({ type: CreateCocktailIngredientDto })
  @ApiResponse({ status: 201, description: 'The cocktail ingredient has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  async create(@Body() createCocktailIngredientDto: CreateCocktailIngredientDto) {
    return await this.cocktailIngredientsService.create(createCocktailIngredientDto);
  }


  @Get('')
  @ApiOperation({ summary: 'Get all of the Cocktail Ingredients for a given Cocktail' })
  @ApiParam({ name: 'cocktailId', type: Number })
  @ApiResponse({ status: 200, description: 'The cocktail ingredient.' })
  @ApiResponse({ status: 404, description: 'Cocktail ingredient not found.' })
  async findAllForCocktail(
    @Param('cocktailId') cocktailId: string,
  ) {
    return await this.cocktailIngredientsService.findAllForCocktail(+cocktailId);
  }

  @Get(':ingredientId')
  @ApiOperation({ summary: 'Get a cocktail ingredient by id' })
  @ApiParam({ name: 'cocktailId', type: Number })
  @ApiParam({ name: 'ingredientId', type: Number })
  @ApiResponse({ status: 200, description: 'The cocktail ingredient.' })
  @ApiResponse({ status: 404, description: 'Cocktail ingredient not found.' })
  async findOne(
    @Param('cocktailId') cocktailId: string,
    @Param('ingredientId') ingredientId: string,) {
    return await this.cocktailIngredientsService.findOne(+cocktailId, +ingredientId);
  }

  @Patch(':ingredientId')
  @ApiOperation({ summary: 'Update a cocktail ingredient' })
  @ApiParam({ name: 'cocktailId', type: Number })
  @ApiParam({ name: 'ingredientId', type: Number })
  @ApiBody({ type: UpdateCocktailIngredientDto })
  @ApiResponse({ status: 200, description: 'The cocktail ingredient has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Cocktail ingredient not found.' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  async update(
    @Param('cocktailId') cocktailId: string,
    @Param('ingredientId') ingredientId: string,
    @Body() updateCocktailIngredientDto: UpdateCocktailIngredientDto,
  ) {
    return await this.cocktailIngredientsService.update(+cocktailId, +ingredientId, updateCocktailIngredientDto);
  }
  @Delete(':ingredientId')
  @ApiOperation({ summary: 'Delete a cocktail ingredient' })
  @ApiParam({ name: 'cocktailId', type: Number })
  @ApiParam({ name: 'ingredientId', type: Number })
  @ApiResponse({ status: 204, description: 'The cocktail ingredient has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Cocktail ingredient not found.' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('cocktailId') cocktailId: string,
    @Param('ingredientId') ingredientId: string,
  ) {
    await this.cocktailIngredientsService.remove(+cocktailId, +ingredientId);
  }
}