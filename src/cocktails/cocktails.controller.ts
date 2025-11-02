import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CocktailsService } from './cocktails.service';
import { CreateCocktailDto } from './dto/create-cocktail.dto';
import { UpdateCocktailDto } from './dto/update-cocktail.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Cocktails')
@Controller('cocktails')
export class CocktailsController {
  constructor(private readonly cocktailsService: CocktailsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new cocktail' })
  @ApiBody({ type: CreateCocktailDto })
  @ApiResponse({ status: 201, description: 'Cocktail created successfully.' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async create(@Body() createCocktailDto: CreateCocktailDto, @UploadedFile() image: Express.Multer.File) {
    return await this.cocktailsService.create(createCocktailDto, image);
  }

  @Get()
  @ApiOperation({ summary: 'Get all cocktails' })
  @ApiResponse({ status: 200, description: 'List of cocktails.' })
  async findAll() {
    return await this.cocktailsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get all of the data associated with a cocktail by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Cocktail found.' })
  @ApiResponse({ status: 404, description: 'Cocktail not found.' })
  async findOne(@Param('id') id: string) {
    return await this.cocktailsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a cocktail by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateCocktailDto })
  @ApiResponse({ status: 200, description: 'Cocktail updated.' })
  @ApiResponse({ status: 404, description: 'Cocktail not found.' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async update(@Param('id') id: string, @Body() updateCocktailDto: UpdateCocktailDto, @UploadedFile() image: Express.Multer.File ) {
    return await this.cocktailsService.update(+id, updateCocktailDto, image);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a cocktail by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Cocktail deleted.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  async remove(@Param('id') id: string) {
    await this.cocktailsService.remove(+id);
  }
}
