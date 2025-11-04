import { NotFoundException } from "@nestjs/common";

import { CocktailCategoriesController } from "./cocktail-categories.controller";
import type { CocktailCategoriesService } from "./cocktail-categories.service";

describe("CocktailCategoriesController", () => {
  let controller: CocktailCategoriesController;
  let service: jest.Mocked<CocktailCategoriesService>;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new CocktailCategoriesController(service);
  });

  describe("create", () => {
    it("should create a new cocktail category", async () => {
      const dto = { name: "Tropical", description: "Fruity cocktails" };
      const created = { ...dto };
      service.create.mockResolvedValue(created);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });

    it("should propagate errors from the service", async () => {
      service.create.mockRejectedValue(new Error("Validation error"));
      await expect(controller.create({ name: "" })).rejects.toThrow(
        "Validation error",
      );
    });
  });

  describe("findAll", () => {
    it("should return all cocktail categories", async () => {
      const mock = [
        { name: "Classic", description: "Traditional drinks" },
        { name: "Signature", description: "Unique house mixes" },
      ];
      service.findAll.mockResolvedValue(mock);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mock);
    });

    it("should return an empty list if no categories exist", async () => {
      service.findAll.mockResolvedValue([]);
      const result = await controller.findAll();
      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return a cocktail category by name", async () => {
      const mockCategory = { name: "Tiki", description: "Tropical drinks" };
      service.findOne.mockResolvedValue(mockCategory);

      const result = await controller.findOne("Tiki");

      expect(service.findOne).toHaveBeenCalledWith("Tiki");
      expect(result).toEqual(mockCategory);
    });

    it("should propagate NotFoundException", async () => {
      service.findOne.mockRejectedValue(new NotFoundException());
      await expect(controller.findOne("Ghost")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("should update a cocktail category", async () => {
      const dto = { description: "Updated info" };
      const updated = { name: "Classic", description: "Updated info" };
      service.update.mockResolvedValue(updated);

      const result = await controller.update("Classic", dto);

      expect(service.update).toHaveBeenCalledWith("Classic", dto);
      expect(result).toEqual(updated);
    });

    it("should propagate NotFoundException if category not found", async () => {
      service.update.mockRejectedValue(new NotFoundException());
      await expect(controller.update("Missing", {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("should delete a cocktail category", async () => {
      const deleted = { name: "Tiki", description: "Deleted" };
      service.remove.mockResolvedValue(deleted);

      const result = await controller.remove("Tiki");

      expect(service.remove).toHaveBeenCalledWith("Tiki");
      expect(result).toEqual(deleted);
    });

    it("should propagate NotFoundException when category does not exist", async () => {
      service.remove.mockRejectedValue(new NotFoundException());
      await expect(controller.remove("NonExistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
