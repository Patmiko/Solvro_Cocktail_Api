import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Ratings')
@Controller('cocktails')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post(':cocktailId/ratings')
  @ApiOperation({ summary: 'Create a new rating for a cocktail' })
  @ApiBody({ type: CreateRatingDto })
  @ApiParam({ name: 'cocktailId', type: Number })
  @ApiResponse({ status: 201, description: 'The rating has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 409, description: 'You have already rated this cocktail.' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  async create(@Body() createRatingDto: CreateRatingDto, @Request() request,
  @Param('cocktailId') cocktailId: string
) {
    return await this.ratingsService.create(createRatingDto, request.user.email, +cocktailId);
  }

  @Get(":cocktailId/ratings")
  @ApiOperation({ summary: 'Get all ratings for a cocktail' })
  @ApiResponse({ status: 200, description: 'List of ratings returned.' })
  @ApiParam({ name: 'cocktailId', type: Number })
  async findAll(
    @Param('cocktailId') cocktailId: string
  ) {
    return await this.ratingsService.findAll(+cocktailId);
  }

  @Get('cocktails/ratings/me')
  @ApiOperation({ summary: 'Get all ratings by the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of user ratings returned.' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  async findAllByUser(@Request() request) {
    return await this.ratingsService.findAllByUser(request.user.email);
  }
  

  @Get(':cocktailId/ratings/:userEmail')
  @ApiOperation({ summary: 'Get a specific rating by cocktailId and Email' })
  @ApiParam({ name: 'cocktailId', type: Number })
  @ApiParam({ name: 'userEmail', type: String })
  @ApiResponse({ status: 200, description: 'The rating has been successfully fetched.' })
  @ApiResponse({ status: 404, description: 'Rating not found.' })
  async findOne(
  @Param('cocktailId') cocktailId: string,
  @Param('userEmail') userEmail: string,
) {
    return await this.ratingsService.findOne(+cocktailId, userEmail);
  }

  @Patch(':cocktailId/ratings/:userEmail')
  @ApiOperation({ summary: 'Update a rating by cocktailId and userEmail' })
  @ApiParam({ name: 'userEmail', type: String })
  @ApiParam({ name: 'cocktailId', type: Number })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  @ApiBody({ type: UpdateRatingDto })
  @ApiResponse({ status: 200, description: 'The rating has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Rating not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized to update this rating.' })
  async update(@Param('cocktailId') cocktailId: number,
  @Param('userEmail') userEmail: string,
   @Body() updateRatingDto: UpdateRatingDto,
  @Request() request,
  ) {
    return await this.ratingsService.update(cocktailId, updateRatingDto, userEmail, request.user);
  }

  @Delete(':cocktailId/ratings/:userEmail')
  @ApiOperation({ summary: 'Delete a rating by cocktailId and userEmail' })
  @ApiParam({ name: 'userEmail', type: String })
  @ApiParam({ name: 'cocktailId', type: Number })
  @UseGuards(AuthGuard)
  @ApiBearerAuth("access-token")
  @ApiResponse({ status: 200, description: 'The rating has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Rating not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized to delete this rating.' })
  async remove(@Param('cocktailId') cocktailId: number,
  @Param('userEmail') userEmail: string,
  @Request() request,
) {
    return await this.ratingsService.remove(cocktailId, userEmail,request.user);
  }
}
