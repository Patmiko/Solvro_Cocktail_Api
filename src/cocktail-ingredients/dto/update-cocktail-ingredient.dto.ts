import { PartialType } from '@nestjs/swagger';
import { CreateCocktailIngredientDto } from './create-cocktail-ingredient.dto';

export class UpdateCocktailIngredientDto extends PartialType(CreateCocktailIngredientDto) {}
