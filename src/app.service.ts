import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): {
    title: string;
    authors: string;
  } {
    return {
      title: "Solvro Cocktail API",
      authors: "Patryk Mikołajewicz",
    };
  }
}
