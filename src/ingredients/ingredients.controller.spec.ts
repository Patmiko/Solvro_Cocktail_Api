import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { TestingModule } from "@nestjs/testing";

import { AuthGuard } from "../auth/auth.guard";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateIngredientDto } from "./dto/create-ingredient.dto";
import type { UpdateIngredientDto } from "./dto/update-ingredient.dto";
import { IngredientsController } from "./ingredients.controller";
import { IngredientsService } from "./ingredients.service";

describe("IngredientsController", () => {
  let controller: IngredientsController;
  let service: IngredientsService;

  const prismaMock = {
    ingredients: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockIngredientsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngredientsController],
      providers: [
        IngredientsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    })
      .overrideProvider(IngredientsService)
      .useValue(mockIngredientsService)
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<IngredientsController>(IngredientsController);
    service = module.get<IngredientsService>(IngredientsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should successfully create a new ingredient", async () => {
      const mockFile = {
        buffer: Buffer.from("test image data"),
      } as Express.Multer.File;

      const createIngredientDto: CreateIngredientDto = {
        name: "Gin",
        typeName: "Spirit",
        alcoholic: true,
        percentage: 40,
        image: mockFile,
      };

      const mockCreatedIngredient = {
        id: 1,
        name: "Gin",
        typeName: "Spirit",
        alcoholic: true,
        percentage: 40,
        imageUrl: "/media/ingredients/randomImage.png",
      };

      mockIngredientsService.create.mockResolvedValue(mockCreatedIngredient);

      const result = await controller.create(createIngredientDto, mockFile);

      expect(result).toEqual(mockCreatedIngredient);
      expect(service.create).toHaveBeenCalledWith(
        createIngredientDto,
        mockFile,
      );
    });

    it("should throw an error if image is not provided", async () => {
      const dto = {
        name: "Gin",
        typeName: "Spirit",
        alcoholic: true,
        percentage: 40,
        image: undefined,
      };

      mockIngredientsService.create.mockRejectedValue(
        new Error("Image file is required"),
      );

      await expect(controller.create(dto as any, null)).rejects.toThrow(
        "Image file is required",
      );
    });
  });

  describe("findAll", () => {
    it("should return a list of all ingredients", async () => {
      const mockIngredients = [
        {
          id: 1,
          name: "Gin",
          alcoholic: true,
          typeName: "Spirit",
          percentage: 40,
          imageUrl: "/media/ingredients/gin.png",
        },
      ];

      jest.spyOn(service, "findAll").mockResolvedValue(mockIngredients);

      const result = await controller.findAll(
        undefined,
        undefined,
        undefined,
        undefined,
        "asc",
      );

      expect(result).toEqual(mockIngredients);
      expect(service.findAll).toHaveBeenCalledWith({
        type: undefined,
        alcoholic: undefined,
        name: undefined,
        sort: undefined,
        order: "asc",
      });
    });

    it("should filter ingredients by type", async () => {
      const mockIngredients = [
        {
          id: 1,
          name: "Gin",
          alcoholic: true,
          typeName: "Spirit",
          percentage: 40,
          imageUrl: "/media/ingredients/gin.png",
        },
      ];

      jest.spyOn(service, "findAll").mockResolvedValue(mockIngredients);

      const result = await controller.findAll(
        "Spirit",
        undefined,
        undefined,
        undefined,
        "asc",
      );

      expect(result).toEqual(mockIngredients);
      expect(service.findAll).toHaveBeenCalledWith({
        type: "Spirit",
        alcoholic: undefined,
        name: undefined,
        sort: undefined,
        order: "asc",
      });
    });
  });

  describe("findOne", () => {
    it("should return an ingredient by ID", async () => {
      const mockIngredient = {
        id: 1,
        name: "Gin",
        alcoholic: true,
        typeName: "Spirit",
        percentage: 40,
        imageUrl: "/media/ingredients/gin.png",
      };

      mockIngredientsService.findOne.mockResolvedValue(mockIngredient);

      const result = await controller.findOne("1");

      expect(result).toEqual(mockIngredient);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it("should throw error if ingredient is not found", async () => {
      mockIngredientsService.findOne.mockRejectedValue(
        new NotFoundException("Ingredient with ID 999 not found"),
      );

      await expect(controller.findOne("999")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("should successfully update an ingredient", async () => {
      const updateIngredientDto: UpdateIngredientDto = {
        name: "Updated Gin",
        typeName: "Spirit",
        alcoholic: true,
        percentage: 42,
      };

      const mockFile = {
        buffer: Buffer.from("updated image data"),
      } as Express.Multer.File;

      const mockUpdatedIngredient = {
        id: 1,
        ...updateIngredientDto,
        imageUrl: "/media/ingredients/updated_image.png",
      };

      mockIngredientsService.update.mockResolvedValue(mockUpdatedIngredient);

      const result = await controller.update(
        "1",
        updateIngredientDto,
        mockFile,
      );

      expect(result).toEqual(mockUpdatedIngredient);
      expect(service.update).toHaveBeenCalledWith(
        1,
        updateIngredientDto,
        mockFile,
      );
    });

    it("should throw error if ingredient not found on update", async () => {
      const updateIngredientDto: UpdateIngredientDto = {
        name: "Updated Gin",
        typeName: "Spirit",
        alcoholic: true,
        percentage: 42,
      };

      const mockFile = {
        buffer: Buffer.from("updated image data"),
      } as Express.Multer.File;

      mockIngredientsService.update.mockRejectedValue(
        new NotFoundException("Ingredient with ID 999 not found"),
      );

      await expect(
        controller.update("999", updateIngredientDto, mockFile),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should throw error if ingredient not found on delete", async () => {
      mockIngredientsService.remove.mockRejectedValue(
        new NotFoundException("Ingredient with ID 999 not found"),
      );

      await expect(controller.remove("999")).rejects.toThrow(NotFoundException);
    });
  });
});
