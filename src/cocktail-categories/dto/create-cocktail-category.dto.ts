import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateCocktailCategoryDto {
    @ApiProperty({
        description: 'The display name of the cocktail category (e.g., "Classic", "Tropical", "Dessert")',
        example: 'Cocktail',
    })

    @IsString()
    @IsNotEmpty()
    name: string;

    
}
