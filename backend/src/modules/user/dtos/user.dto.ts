import { AbstractDto } from "../../../common/dto/abstract.dto";
import { RoleType } from "../../../constants";
import {
  EmailFieldOptional,
  EnumFieldOptional,
  StringFieldOptional,
} from "../../../decorators";
import { type UserEntity } from "../user.entity";

export class UserDto extends AbstractDto {
  @StringFieldOptional({ nullable: true })
  firstName?: string | null;

  @StringFieldOptional({ nullable: true })
  lastName?: string | null;

  @EnumFieldOptional(() => RoleType)
  role?: RoleType;

  @EmailFieldOptional({ nullable: true })
  email?: string | null;

  constructor(user: UserEntity) {
    super(user);
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.role = user.role;
    this.email = user.email;
  }
}
