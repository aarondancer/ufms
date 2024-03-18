import { type UserDto } from "../../user/dtos/user.dto";
import { type TokenPayloadDto } from "./token-payload.dto";

export class LoginPayloadDto {
  private user: UserDto;

  private token: TokenPayloadDto;

  constructor(user: UserDto, token: TokenPayloadDto) {
    this.user = user;
    this.token = token;
  }

  getUser(): UserDto {
    return this.user;
  }

  setUser(user: UserDto): void {
    this.user = user;
  }

  getToken(): TokenPayloadDto {
    return this.token;
  }

  setToken(token: TokenPayloadDto): void {
    this.token = token;
  }
}
