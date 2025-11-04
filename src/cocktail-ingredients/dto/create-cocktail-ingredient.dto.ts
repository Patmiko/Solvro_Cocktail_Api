import { IsNumber, IsOptional, IsString } from "class-validator";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCocktailIngredientDto {
  @ApiProperty({ example: 2, description: "ID of the ingredient" })
  @IsNumber()
  ingredientId: number;

  @ApiProperty({ example: "50ml", description: "Amount of the ingredient" })
  @IsString()
  amount: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: "Freshly squeezed",
    description: "Optional note about the ingredient",
  })
  note?: string;
}
