import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('ingredients')
@ApiTags('Ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ingredient' })
  @ApiBody({ type: CreateIngredientDto })
  @ApiResponse({ status: 201, description: 'Ingredient created successfully.' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async create(@Body() createIngredientDto: CreateIngredientDto, @UploadedFile() file: Express.Multer.File) {
    return await this.ingredientsService.create(createIngredientDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ingredients' })
  @ApiResponse({ status: 200, description: 'List of ingredients.' })
  async findAll() {
    return await this.ingredientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an ingredient by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Ingredient found.' })
  @ApiResponse({ status: 404, description: 'Ingredient not found.' })
  async findOne(@Param('id') id: string) {
    return await this.ingredientsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an ingredient by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateIngredientDto })
  @ApiResponse({ status: 200, description: 'Ingredient updated successfully.' })
  @ApiResponse({ status: 404, description: 'Ingredient not found.' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async update(@Param('id') id: string, @Body() updateIngredientDto: UpdateIngredientDto, @UploadedFile() image: Express.Multer.File) {
    return await this.ingredientsService.update(+id, updateIngredientDto,image);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an ingredient by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Ingredient deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Ingredient not found.' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")  
  async remove(@Param('id') id: string) {
    return await this.ingredientsService.remove(+id);
  }
}
