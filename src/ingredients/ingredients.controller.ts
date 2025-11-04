/* eslint-disable @typescript-eslint/no-unnecessary-boolean-literal-compare */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard";
import { CreateIngredientDto } from "./dto/create-ingredient.dto";
import { UpdateIngredientDto } from "./dto/update-ingredient.dto";
import { IngredientsService } from "./ingredients.service";

@Controller("ingredients")
@ApiTags("Ingredients")
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new ingredient" })
  @ApiBody({ type: CreateIngredientDto })
  @ApiResponse({ status: 201, description: "Ingredient created successfully." })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("image"))
  async create(
    @Body() createIngredientDto: CreateIngredientDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    // Temporary
    createIngredientDto.alcoholic = Boolean(createIngredientDto.alcoholic);
    return await this.ingredientsService.create(createIngredientDto, image);
  }

  @Get()
  @ApiOperation({ summary: "Get all ingredients" })
  @ApiResponse({ status: 200, description: "List of ingredients." })
  @ApiQuery({
    name: "type",
    required: false,
    description: 'Filter ingredients by type (e.g., "Spirit", "Mixer")',
  })
  @ApiQuery({
    name: "alcoholic",
    required: false,
    description: "Filter ingredients by alcoholic content (true/false)",
  })
  @ApiQuery({
    name: "name",
    required: false,
    description: "Search by ingredient name (partial match)",
  })
  @ApiQuery({
    name: "sort",
    required: false,
    description:
      "Field to sort by (e.g., name, percentage, createdAt, updatedAt)",
  })
  @ApiQuery({
    name: "order",
    required: false,
    description: "Sort order (asc or desc)",
    example: "asc",
  })
  async findAll(
    @Query("type") type?: string,
    @Query("alcoholic") alcoholic?: string,
    @Query("name") name?: string,
    @Query("sort") sort?: string,
    @Query("order") order: "asc" | "desc" = "asc",
  ) {
    return await this.ingredientsService.findAll({
      type,
      alcoholic,
      name,
      sort,
      order,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an ingredient by id" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "Ingredient found." })
  @ApiResponse({ status: 404, description: "Ingredient not found." })
  async findOne(@Param("id") id: string) {
    return await this.ingredientsService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an ingredient by id" })
  @ApiParam({ name: "id", type: Number })
  @ApiBody({ type: UpdateIngredientDto })
  @ApiResponse({ status: 200, description: "Ingredient updated successfully." })
  @ApiResponse({ status: 404, description: "Ingredient not found." })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("image"))
  async update(
    @Param("id") id: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return await this.ingredientsService.update(
      +id,
      updateIngredientDto,
      image,
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an ingredient by id" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "Ingredient deleted successfully." })
  @ApiResponse({ status: 404, description: "Ingredient not found." })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  async remove(@Param("id") id: string) {
    return await this.ingredientsService.remove(+id);
  }
}
