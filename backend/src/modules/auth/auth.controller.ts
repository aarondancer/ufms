import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { RoleType } from "../../constants";
import { Auth, AuthUser } from "../../decorators";
import { UserDto } from "../user/dtos/user.dto";
import { UserEntity } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { AuthService } from "./auth.service";
import { LoginPayloadDto } from "./dto/login-payload.dto";
import { UserLoginDto } from "./dto/user-login.dto";
import { UserRegisterDto } from "./dto/user-register.dto";
import { TokenPayloadDto } from "./dto/token-payload.dto";

const ALLOWED_EMAIL_REGEX = /.+@fpi\.test$/i;
const SECURE_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

@Controller("auth")
@ApiTags("auth")
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: LoginPayloadDto,
    description: "User info with access token",
  })
  async userLogin(
    @Body() userLoginDto: UserLoginDto,
  ): Promise<LoginPayloadDto> {
    if (!ALLOWED_EMAIL_REGEX.test(userLoginDto.email)) {
      throw new BadRequestException(
        "Only @fpi.test email addresses are allowed",
      );
    }

    const userEntity = await this.authService.validateUser(userLoginDto);

    const token = await this.authService.createAccessToken({
      userId: userEntity.id,
      role: userEntity.role,
    });

    return new LoginPayloadDto(new UserDto(userEntity), token);
  }

  @Post("register")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserDto, description: "Successfully Registered" })
  async userRegister(
    @Body() userRegisterDto: UserRegisterDto,
  ): Promise<UserDto> {
    if (!ALLOWED_EMAIL_REGEX.test(userRegisterDto.email)) {
      throw new BadRequestException(
        "Only @fpi.test email addresses are allowed",
      );
    }

    if (!SECURE_PASSWORD_REGEX.test(userRegisterDto.password)) {
      throw new BadRequestException(
        // eslint-disable-next-line max-len
        "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character",
      );
    }

    const createdUser = await this.userService.createUser(userRegisterDto);

    return new UserDto(createdUser);
  }

  @Get("api-key")
  @HttpCode(HttpStatus.OK)
  @Auth([RoleType.USER, RoleType.ADMIN])
  @ApiOkResponse({
    type: UserDto,
    description: "generates an API key for external integrations",
  })
  getApiKey(@AuthUser() user: UserEntity): Promise<TokenPayloadDto> {
    return this.authService.createAccessToken({
      userId: user.id,
      role: user.role,
      expiresIn: 60 * 60 * 24 * 90, // 90 days
    });
  }

  @Get("me")
  @HttpCode(HttpStatus.OK)
  @Auth([RoleType.USER, RoleType.ADMIN])
  @ApiOkResponse({ type: UserDto, description: "current user info" })
  getCurrentUser(@AuthUser() user: UserEntity): UserDto {
    return new UserDto(user);
  }
}
