import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { AuthGuard } from "../auth/auth.guard";
import { RoleGuard } from "../auth/roles/role.guard";
import type { CreateIngredientTypeDto } from "./dto/create-ingredient-type.dto";
import type { UpdateIngredientTypeDto } from "./dto/update-ingredient-type.dto";
import { IngredientTypesController } from "./ingredient-types.controller";
import { IngredientTypesService } from "./ingredient-types.service";

describe("IngredientTypesController", () => {
  let controller: IngredientTypesController;
  let service: jest.Mocked<IngredientTypesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngredientTypesController],
      providers: [
        {
          provide: IngredientTypesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: AuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: RoleGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<IngredientTypesController>(
      IngredientTypesController,
    );
    service = module.get(IngredientTypesService);
  });

  describe("create", () => {
    it("should call service.create with correct DTO and return result", async () => {
      const dto: CreateIngredientTypeDto = { name: "Juice" };
      const expected = { id: 1, name: "Juice" };
      service.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(result).toEqual(expected);
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it("should propagate errors thrown by the service", async () => {
      service.create.mockRejectedValue(new Error("Database error"));

      await expect(controller.create({ name: "Juice" })).rejects.toThrow(
        "Database error",
      );
    });
  });

  describe("findAll", () => {
    it("should return all ingredient types", async () => {
      const expected = [
        { name: "Juice" },
        { name: "Alcohol" },
        { name: "Syrup" },
      ];
      service.findAll.mockResolvedValue(expected);

      const result = await controller.findAll();

      expect(result).toEqual(expected);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it("should return empty list when no types exist", async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return a single ingredient type by name", async () => {
      const expected = { name: "Alcohol" };
      service.findOne.mockResolvedValue(expected);

      const result = await controller.findOne("Alcohol");

      expect(result).toEqual(expected);
      expect(service.findOne).toHaveBeenCalledWith("Alcohol");
    });

    it("should propagate NotFoundException from the service", async () => {
      service.findOne.mockRejectedValue(new Error("Not Found"));

      await expect(controller.findOne("Unknown")).rejects.toThrow("Not Found");
    });
  });

  describe("update", () => {
    it("should call service.update with correct parameters", async () => {
      const dto: UpdateIngredientTypeDto = { description: "Updated" };
      const expected = { name: "Juice", description: "Updated" };
      service.update.mockResolvedValue(expected);

      const result = await controller.update("Juice", dto);

      expect(result).toEqual(expected);
      expect(service.update).toHaveBeenCalledWith("Juice", dto);
    });

    it("should propagate errors from the service", async () => {
      service.update.mockRejectedValue(new Error("Not Found"));

      await expect(
        controller.update("Unknown", { description: "Updated" }),
      ).rejects.toThrow("Not Found");
    });
  });

  describe("remove", () => {
    it("should call service.remove with correct name and return result", async () => {
      const expected = { name: "Juice" };
      service.remove.mockResolvedValue(expected);

      const result = await controller.remove("Juice");

      expect(result).toEqual(expected);
      expect(service.remove).toHaveBeenCalledWith("Juice");
    });

    it("should propagate NotFoundException from the service", async () => {
      service.remove.mockRejectedValue(new Error("Not Found"));

      await expect(controller.remove("Unknown")).rejects.toThrow("Not Found");
    });
  });
});
