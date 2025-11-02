import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CocktailCategoriesService } from './cocktail-categories.service';
import { CreateCocktailCategoryDto } from './dto/create-cocktail-category.dto';
import { UpdateCocktailCategoryDto } from './dto/update-cocktail-category.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { RoleGuard } from '../auth/roles/role.guard';
import { Roles } from '../auth/roles/role.decorator';
import { Role } from '@prisma/client';

@Controller('cocktails/categories')
@ApiTags('Cocktail Categories')
export class CocktailCategoriesController {
  constructor(private readonly cocktailCategoriesService: CocktailCategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new cocktail category' })
  @ApiResponse({
    status: 201,
    description: 'The cocktail category has been successfully created.',
  })
  @UseGuards(AuthGuard,RoleGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @ApiBearerAuth("access-token")
  @ApiResponse({
    status: 400,
    description: 'Invalid input. The name field may be missing or invalid.',
  })
  async create(@Body() createCocktailCategoryDto: CreateCocktailCategoryDto) {
    return await this.cocktailCategoriesService.create(createCocktailCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all cocktail categories' })
  @ApiResponse({
    status: 200,
    description: 'A list of all cocktail categories is returned.',
  })
  async findAll() {
    return await this.cocktailCategoriesService.findAll();
  }

  @Get(':name')
  @ApiOperation({ summary: 'Retrieve a specific cocktail category by name' })
  @ApiParam({
    name: 'name',
    description: 'The unique name of the cocktail category (e.g., "Classic", "Tropical").',
    example: 'Classic',
  })
  @ApiResponse({
    status: 200,
    description: 'The requested cocktail category is returned.',
  })
  @ApiResponse({
    status: 404,
    description: 'No cocktail category found with the given name.',
  })
  async findOne(@Param('name') name: string) {
    return await this.cocktailCategoriesService.findOne(name);
  }

  @Patch(':name')
  @ApiOperation({ summary: 'Update a cocktail category by name' })
  @ApiParam({
    name: 'name',
    description: 'The name of the cocktail category to update.',
    example: 'Tropical',
  })
  @ApiResponse({
    status: 200,
    description: 'The cocktail category was successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'The specified cocktail category was not found.',
  })
  @UseGuards(AuthGuard,RoleGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @ApiBearerAuth("access-token")
  async update(
    @Param('name') name: string,
    @Body() updateCocktailCategoryDto: UpdateCocktailCategoryDto,
  ) {
    return await this.cocktailCategoriesService.update(name, updateCocktailCategoryDto);
  }

  @Delete(':name')
  @ApiOperation({ summary: 'Delete a cocktail category by name' })
  @ApiParam({
    name: 'name',
    description: 'The name of the cocktail category to delete.',
    example: 'Classic',
  })
  @ApiResponse({
    status: 200,
    description: 'The cocktail category was successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'The specified cocktail category was not found.',
  })
  @UseGuards(AuthGuard,RoleGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @ApiBearerAuth("access-token")
  async remove(@Param('name') name: string) {
    return await this.cocktailCategoriesService.remove(name);
  }
}
