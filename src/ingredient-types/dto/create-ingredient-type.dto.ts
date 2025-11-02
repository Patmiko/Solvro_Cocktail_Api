import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIngredientTypeDto {
  @ApiProperty({
    description: 'The display name of the ingredient type (e.g., "Spirit", "Juice", "Syrup")',
    example: 'Spirit',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
