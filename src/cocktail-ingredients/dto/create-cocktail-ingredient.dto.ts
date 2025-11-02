import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCocktailIngredientDto {
    @IsNumber()
    @ApiProperty({ example: 1, description: 'ID of the cocktail' })
    cocktailId: number;

    @ApiProperty({ example: 2, description: 'ID of the ingredient' })
    @IsNumber()
    ingredientId: number;

    @ApiProperty({ example: '50ml', description: 'Amount of the ingredient' })
    @IsString()
    amount: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ example: 'Freshly squeezed', description: 'Optional note about the ingredient' })
    note?: string;
}
