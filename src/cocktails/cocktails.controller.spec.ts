import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { AuthGuard } from "../auth/auth.guard";
import { CocktailsController } from "./cocktails.controller";
import { CocktailsService } from "./cocktails.service";

describe("CocktailsController", () => {
  let controller: CocktailsController;
  let service: jest.Mocked<CocktailsService>;

  beforeEach(async () => {
    const mockCocktailsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CocktailsController],
      providers: [
        { provide: CocktailsService, useValue: mockCocktailsService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CocktailsController>(CocktailsController);
    service = module.get(CocktailsService) as jest.Mocked<CocktailsService>;
  });

  afterEach(() => jest.clearAllMocks());

  describe("create", () => {
    it("should create a cocktail", async () => {
      const dto = {
        name: "Mojito",
        instructions: "Mix and serve.",
        glass: "Highball",
        categoryName: "Cocktail",
      };
      const mockFile = {
        buffer: Buffer.from("fake-image"),
      } as Express.Multer.File;
      const expected = { id: 1, ...dto };

      service.create.mockResolvedValue(expected);

      const result = await controller.create(dto, mockFile);

      expect(service.create).toHaveBeenCalledWith(dto, mockFile);
      expect(result).toEqual(expected);
    });
  });

  describe("findAll", () => {
    it("should return all cocktails", async () => {
      const mockData = [{ id: 1, name: "Margarita" }];
      service.findAll.mockResolvedValue(mockData);

      const result = await controller.findAll(
        undefined,
        "asc",
        undefined,
        undefined,
        undefined,
      );

      expect(service.findAll).toHaveBeenCalledWith({
        sort: undefined,
        order: "asc",
        name: undefined,
        hasAlcohol: undefined,
        ingredients: undefined,
      });
      expect(result).toEqual(mockData);
    });

    it("should call with query filters", async () => {
      const mockData = [{ id: 2, name: "Gin Tonic" }];
      service.findAll.mockResolvedValue(mockData);

      const result = await controller.findAll(
        "name",
        "desc",
        "gin",
        "true",
        "lime,gin",
      );

      expect(service.findAll).toHaveBeenCalledWith({
        sort: "name",
        order: "desc",
        name: "gin",
        hasAlcohol: "true",
        ingredients: "lime,gin",
      });
      expect(result).toEqual(mockData);
    });
  });

  describe("findOne", () => {
    it("should return a cocktail by id", async () => {
      const mockData = { id: 1, name: "Margarita" };
      service.findOne.mockResolvedValue(mockData);

      const result = await controller.findOne("1");

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockData);
    });
  });

  describe("update", () => {
    it("should update a cocktail", async () => {
      const dto = {
        name: "Updated Mojito",
        instructions: "Updated",
        glass: "Cocktail",
      };
      const mockFile = {
        buffer: Buffer.from("new-image"),
      } as Express.Multer.File;
      const expected = { id: 1, ...dto };

      service.update.mockResolvedValue(expected);

      const result = await controller.update("1", dto, mockFile);

      expect(service.update).toHaveBeenCalledWith(1, dto, mockFile);
      expect(result).toEqual(expected);
    });
  });

  describe("remove", () => {
    it("should remove a cocktail", async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove("1");

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
