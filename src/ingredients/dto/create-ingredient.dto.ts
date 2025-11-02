import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {  IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf } from "class-validator";

export class CreateIngredientDto {
    @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The name of the ingredient.',
    example: 'Lemon Juice',
  })
  name: string;

  @IsNotEmpty()
  @IsBoolean()
  @Type(() => Boolean)
  @ApiProperty({
    description: 'Whether the ingredient is alcoholic.',
    example: false,
  })
  alcoholic: boolean;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The type or category name of the ingredient (e.g., "Juice", "Spirit").',
    example: 'Juice',
  })
  typeName?: string;

  @IsString()
  @IsOptional()
    @ApiPropertyOptional({
    description: 'A brief description of the ingredient.',
    example: 'Freshly squeezed lemon juice adds a tangy flavor to cocktails.',
  })
  description?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'The alcohol percentage of the ingredient (if alcoholic).',
    example: 0,
  })
  percentage?: number;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  @ValidateIf(o => o.image !== undefined)
    image: any;


}
