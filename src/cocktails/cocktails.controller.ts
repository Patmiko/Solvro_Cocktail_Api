import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { CocktailsService } from "./cocktails.service";
import { CreateCocktailDto } from "./dto/create-cocktail.dto";
import { UpdateCocktailDto } from "./dto/update-cocktail.dto";

@ApiTags("Cocktails")
@Controller("cocktails")
export class CocktailsController {
  constructor(private readonly cocktailsService: CocktailsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new cocktail" })
  @ApiBody({ type: CreateCocktailDto })
  @ApiResponse({ status: 201, description: "Cocktail created successfully." })
  @ApiResponse({ status: 400, description: "Invalid input data." })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("image"))
  async create(
    @Body() createCocktailDto: CreateCocktailDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return await this.cocktailsService.create(createCocktailDto, image);
  }

  @Get()
  @ApiOperation({ summary: "Get all cocktails" })
  @ApiResponse({ status: 200, description: "List of cocktails." })
  @ApiQuery({
    name: "sort",
    required: false,
    description: "Field to sort by (e.g., name, createdAt, updatedAt)",
  })
  @ApiQuery({
    name: "order",
    required: false,
    description: "Sort order (asc or desc)",
    example: "asc",
  })
  @ApiQuery({
    name: "name",
    required: false,
    description: "Search by cocktail name (partial match)",
  })
  @ApiQuery({
    name: "hasAlcohol",
    required: false,
    description: "Filter cocktails that contain alcohol (true/false)",
    example: "true",
  })
  @ApiQuery({
    name: "ingredients",
    required: false,
    description:
      "Comma-separated list of ingredients to filter by (e.g., rum,lime)",
  })
  async findAll(
    @Query("sort") sort?: string,
    @Query("order") order: "asc" | "desc" = "asc",
    @Query("name") name?: string,
    @Query("hasAlcohol") hasAlcohol?: string,
    @Query("ingredients") ingredients?: string,
  ) {
    return await this.cocktailsService.findAll({
      sort,
      order,
      name,
      hasAlcohol,
      ingredients,
    });
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get all of the data associated with a cocktail by ID",
  })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Cocktail found." })
  @ApiResponse({ status: 404, description: "Cocktail not found." })
  async findOne(@Param("id") id: string) {
    return await this.cocktailsService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a cocktail by ID" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ type: UpdateCocktailDto })
  @ApiResponse({ status: 200, description: "Cocktail updated." })
  @ApiResponse({ status: 404, description: "Cocktail not found." })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("image"))
  async update(
    @Param("id") id: string,
    @Body() updateCocktailDto: UpdateCocktailDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return await this.cocktailsService.update(+id, updateCocktailDto, image);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a cocktail by ID" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 204, description: "Cocktail deleted." })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  async remove(@Param("id") id: string) {
    await this.cocktailsService.remove(+id);
  }
}
