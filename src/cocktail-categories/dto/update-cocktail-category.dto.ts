import { PartialType } from '@nestjs/swagger';
import { CreateCocktailCategoryDto } from './create-cocktail-category.dto';

export class UpdateCocktailCategoryDto extends PartialType(CreateCocktailCategoryDto) {}
