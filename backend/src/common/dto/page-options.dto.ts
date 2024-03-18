import { Order } from "../../constants";
import {
  EnumFieldOptional,
  NumberFieldOptional,
  StringFieldOptional,
} from "../../decorators";

export class PageOptionsDto {
  @EnumFieldOptional(() => Order, {
    default: Order.DESC,
  })
  readonly order: Order = Order.DESC;

  @StringFieldOptional()
  readonly orderBy: string = "created_at";

  @NumberFieldOptional({
    minimum: 1,
    default: 1,
    int: true,
  })
  readonly page: number = 1;

  @NumberFieldOptional({
    minimum: 1,
    maximum: 50,
    default: 10,
    int: true,
  })
  readonly take: number = 10;

  get skip(): number {
    return (this.page - 1) * this.take;
  }

  @StringFieldOptional()
  readonly q?: string;

  constructor(partial: Partial<PageOptionsDto>) {
    Object.assign(this, partial);
  }
}
