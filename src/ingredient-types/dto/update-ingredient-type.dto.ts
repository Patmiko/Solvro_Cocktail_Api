import { PartialType } from '@nestjs/swagger';
import { CreateIngredientTypeDto } from './create-ingredient-type.dto';

export class UpdateIngredientTypeDto extends PartialType(CreateIngredientTypeDto) {}
