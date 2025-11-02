import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CocktailIngredientsController } from './cocktail-ingredients.controller';
import { CocktailIngredientsService } from './cocktail-ingredients.service';

describe('CocktailIngredientsController', () => {
  let controller: CocktailIngredientsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CocktailIngredientsController],
      providers: [CocktailIngredientsService],
    }).compile();

    controller = module.get<CocktailIngredientsController>(CocktailIngredientsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
