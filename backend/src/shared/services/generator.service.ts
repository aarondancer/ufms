import { Injectable } from "@nestjs/common";
import { v1 as uuid } from "uuid";

@Injectable()
export class GeneratorService {
  public uuid(): string {
    return uuid();
  }
}
