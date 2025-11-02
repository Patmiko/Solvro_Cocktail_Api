import { Role } from "@prisma/client";

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard";
import { Roles } from "../auth/roles/role.decorator";
import { RoleGuard } from "../auth/roles/role.guard";
import { CreateIngredientTypeDto } from "./dto/create-ingredient-type.dto";
import { UpdateIngredientTypeDto } from "./dto/update-ingredient-type.dto";
import { IngredientTypesService } from "./ingredient-types.service";

@Controller("ingredients/types")
@ApiTags("Ingredient Types")
export class IngredientTypesController {
  constructor(
    private readonly ingredientTypesService: IngredientTypesService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new ingredient type" })
  @ApiResponse({
    status: 201,
    description: "Ingredient type successfully created.",
  })
  @ApiResponse({ status: 400, description: "Invalid input data." })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @ApiBearerAuth("access-token")
  async create(@Body() createIngredientTypeDto: CreateIngredientTypeDto) {
    return await this.ingredientTypesService.create(createIngredientTypeDto);
  }

  @Get()
  @ApiOperation({ summary: "Retrieve all ingredient types" })
  @ApiResponse({
    status: 200,
    description: "List of all ingredient types returned.",
  })
  async findAll() {
    return await this.ingredientTypesService.findAll();
  }

  @Get(":name")
  @ApiOperation({ summary: "Get a specific ingredient type by Name" })
  @ApiResponse({ status: 200, description: "Ingredient type found." })
  @ApiResponse({ status: 404, description: "Ingredient type not found." })
  async findOne(@Param("name") name: string) {
    return await this.ingredientTypesService.findOne(name);
  }

  @Patch(":name")
  @ApiOperation({ summary: "Update an existing ingredient type" })
  @ApiResponse({
    status: 200,
    description: "Ingredient type successfully updated.",
  })
  @ApiResponse({ status: 404, description: "Ingredient type not found." })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @ApiBearerAuth("access-token")
  async update(
    @Param("name") name: string,
    @Body() updateIngredientTypeDto: UpdateIngredientTypeDto,
  ) {
    return await this.ingredientTypesService.update(
      name,
      updateIngredientTypeDto,
    );
  }

  @Delete(":name")
  @ApiOperation({ summary: "Delete an ingredient type by Name" })
  @ApiResponse({
    status: 200,
    description: "Ingredient type successfully deleted.",
  })
  @ApiResponse({ status: 404, description: "Ingredient type not found." })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @ApiBearerAuth("access-token")
  async remove(@Param("name") name: string) {
    return await this.ingredientTypesService.remove(name);
  }
}
