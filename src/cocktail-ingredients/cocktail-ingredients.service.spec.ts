import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CocktailIngredientsService } from './cocktail-ingredients.service';

describe('CocktailIngredientsService', () => {
  let service: CocktailIngredientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CocktailIngredientsService],
    }).compile();

    service = module.get<CocktailIngredientsService>(CocktailIngredientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
