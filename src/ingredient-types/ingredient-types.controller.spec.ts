import { Test, TestingModule } from '@nestjs/testing';
import { IngredientTypesController } from './ingredient-types.controller';
import { IngredientTypesService } from './ingredient-types.service';

describe('IngredientTypesController', () => {
  let controller: IngredientTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngredientTypesController],
      providers: [IngredientTypesService],
    }).compile();

    controller = module.get<IngredientTypesController>(IngredientTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
