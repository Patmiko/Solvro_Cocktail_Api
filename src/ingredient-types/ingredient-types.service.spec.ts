import { Test, TestingModule } from '@nestjs/testing';
import { IngredientTypesService } from './ingredient-types.service';

describe('IngredientTypesService', () => {
  let service: IngredientTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IngredientTypesService],
    }).compile();

    service = module.get<IngredientTypesService>(IngredientTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
