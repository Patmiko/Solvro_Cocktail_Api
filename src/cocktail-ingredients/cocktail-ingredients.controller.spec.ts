import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { AuthGuard } from "../auth/auth.guard";
import { CocktailIngredientsController } from "../cocktail-ingredients/cocktail-ingredients.controller";
import { CocktailIngredientsService } from "../cocktail-ingredients/cocktail-ingredients.service";

describe("CocktailIngredientsController", () => {
  let controller: CocktailIngredientsController;
  let service: jest.Mocked<CocktailIngredientsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CocktailIngredientsController],
      providers: [
        {
          provide: CocktailIngredientsService,
          useValue: {
            create: jest.fn(),
            findAllForCocktail: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CocktailIngredientsController>(
      CocktailIngredientsController,
    );
    service = module.get(CocktailIngredientsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a cocktail ingredient", async () => {
    const dto = { ingredientId: 2, amount: "50ml" };
    const result = { cocktailId: 1, ingredientId: 2, amount: "50ml" };
    service.create.mockResolvedValue(result);
    const response = await controller.create(dto, "1");
    expect(service.create).toHaveBeenCalledWith(1, dto);
    expect(response).toEqual(result);
  });

  it("should return all cocktail ingredients for a cocktail", async () => {
    const mockList = [
      { cocktailId: 1, ingredientId: 2, amount: "50ml" },
      { cocktailId: 1, ingredientId: 3, amount: "20ml" },
    ];
    service.findAllForCocktail.mockResolvedValue(mockList);
    const result = await controller.findAllForCocktail("1");
    expect(service.findAllForCocktail).toHaveBeenCalledWith(1, {
      sort: undefined,
      order: "asc",
      filter: undefined,
      alcoholic: undefined,
    });
    expect(result).toEqual(mockList);
  });

  it("should return one cocktail ingredient", async () => {
    const mockItem = { cocktailId: 1, ingredientId: 2, amount: "50ml" };
    service.findOne.mockResolvedValue(mockItem);
    const result = await controller.findOne("1", "2");
    expect(service.findOne).toHaveBeenCalledWith(1, 2);
    expect(result).toEqual(mockItem);
  });

  it("should update a cocktail ingredient", async () => {
    const updateDto = { amount: "60ml" };
    const updated = { cocktailId: 1, ingredientId: 2, amount: "60ml" };
    service.update.mockResolvedValue(updated);
    const result = await controller.update("1", "2", updateDto);
    expect(service.update).toHaveBeenCalledWith(1, 2, updateDto);
    expect(result).toEqual(updated);
  });

  it("should remove a cocktail ingredient", async () => {
    service.remove.mockResolvedValue(undefined);
    await controller.remove("1", "2");
    expect(service.remove).toHaveBeenCalledWith(1, 2);
  });
});
