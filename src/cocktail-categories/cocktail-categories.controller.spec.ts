import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CocktailCategoriesController } from './cocktail-categories.controller';
import { CocktailCategoriesService } from './cocktail-categories.service';

describe('CocktailCategoriesController', () => {
  let controller: CocktailCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CocktailCategoriesController],
      providers: [CocktailCategoriesService],
    }).compile();

    controller = module.get<CocktailCategoriesController>(CocktailCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
