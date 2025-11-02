import { Controller, Get, HttpCode } from "@nestjs/common";

import { AppService } from "./app.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@Controller("")
@ApiTags("Cocktail Api App")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("")
  @HttpCode(418)
  @ApiOperation({ summary: "Get basic information about the Cocktail API" })
  @ApiResponse({
    status: 200,
    description: "Returns the title and authors of the Cocktail API project.",
  })
  getHello(): {
    title: string;
    authors: string;
  } {
    return this.appService.getHello();
  }
}
