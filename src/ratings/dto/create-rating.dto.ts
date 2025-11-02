import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Max, Min } from "class-validator";

export class CreateRatingDto {
  @ApiProperty({ example: 4.2, description: 'Cocktail rating between 0 and 5' })
  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;
}
