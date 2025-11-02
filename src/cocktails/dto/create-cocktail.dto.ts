import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, ValidateIf } from "class-validator";

export class CreateCocktailDto {
    @ApiProperty({description: 'The name of the cocktail.', example: 'Mojito'})
    @IsString()
    name: string;

    @ApiProperty({description: 'The preparation instructions for the cocktail.', example: 'Muddle mint leaves with sugar and lime juice. Add rum and top with soda water. Garnish with a sprig of mint.'})
    @IsString()
    instructions: string;

    @ApiPropertyOptional({description: 'The category name of the cocktail (e.g., "Classic").', example: 'Classic'})
    @IsString()
    @IsOptional()
    categoryName?: string;

    @ApiProperty({description: 'The type of glass used for the cocktail.', example: 'Highball glass'})
    @IsString()
    glass: string;

    @ApiProperty({ type: 'string', format: 'binary', required: true })
    @ValidateIf(o => o.image !== undefined)
    image: any;
}
