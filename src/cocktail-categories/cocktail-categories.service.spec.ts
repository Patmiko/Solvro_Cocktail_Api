import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CocktailCategoriesService } from './cocktail-categories.service';

describe('CocktailCategoriesService', () => {
  let service: CocktailCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CocktailCategoriesService],
    }).compile();

    service = module.get<CocktailCategoriesService>(CocktailCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
