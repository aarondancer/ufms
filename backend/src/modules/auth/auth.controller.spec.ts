import { Test, type TestingModule } from "@nestjs/testing";

import { AuthController } from "./auth.controller";
import { UserService } from "../user/user.service";
import { AuthService } from "./auth.service";
import { UserLoginDto } from "./dto/user-login.dto";
import { RoleType } from "../../constants";
import { TokenPayloadDto } from "./dto/token-payload.dto";
import { UserRegisterDto } from "./dto/user-register.dto";
import { UserEntity } from "../user/user.entity";
import { UserDto } from "../user/dtos/user.dto";

describe("AuthController", () => {
  let app: TestingModule;
  let controller: AuthController;
  let authService: AuthService;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: UserService,
          useValue: {
            createUser: jest
              .fn()
              .mockImplementation(
                (dto) => Object.assign(new UserEntity(), dto) as UserEntity,
              ),
          },
        },
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            createAccessToken: jest.fn(),
          },
        },
      ],
      imports: [],
    }).compile();

    controller = app.get<AuthController>(AuthController);
    authService = app.get<AuthService>(AuthService);
  });

  describe("auth.controller", () => {
    it("should be defined", () => {
      expect(controller).toBeDefined();
    });

    it("validates the user and generates a token", async () => {
      const userLoginDto = Object.assign(new UserLoginDto(), {
        email: "test@fpi.test",
        password: "password",
      });
      authService.validateUser = jest.fn().mockResolvedValue({
        id: 1,
        role: RoleType.ADMIN,
      });
      authService.createAccessToken = jest
        .fn()
        .mockResolvedValue(
          new TokenPayloadDto({ expiresIn: 3600, accessToken: "token" }),
        );

      const loginDto = await controller.userLogin(userLoginDto);

      expect(loginDto.getToken()).toEqual({
        expiresIn: 3600,
        accessToken: "token",
      });
      expect(loginDto.getUser().id).toEqual(1);
      expect(loginDto.getUser().role).toEqual(RoleType.ADMIN);
    });

    it("denies access to non-FPI emails", async () => {
      const userLoginDto = Object.assign(new UserLoginDto(), {
        email: "test@notfpi.com",
        password: "password",
      });

      await expect(controller.userLogin(userLoginDto)).rejects.toThrow(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        expect.objectContaining({
          message: expect.stringMatching(
            // eslint-disable-next-line max-len
            "Only @fpi.test email addresses are allowed",
          ),
        }),
      );
    });

    it("validates user registration email", async () => {
      await expect(
        controller.userRegister(
          Object.assign(new UserRegisterDto(), {
            email: "test@notfpi.com",
            password: "password",
          }),
        ),
      ).rejects.toThrow(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        expect.objectContaining({
          message: expect.stringMatching(
            // eslint-disable-next-line max-len
            "Only @fpi.test email addresses are allowed",
          ),
        }),
      );
    });

    it("validates user registration password", async () => {
      await expect(
        controller.userRegister(
          Object.assign(new UserRegisterDto(), {
            email: "test@fpi.test",
            password: "password",
          }),
        ),
      ).rejects.toThrow(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        expect.objectContaining({
          message: expect.stringMatching(
            // eslint-disable-next-line max-len
            "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character",
          ),
        }),
      );
    });

    it("registers users with valid email and password", async () => {
      const user = await controller.userRegister(
        Object.assign(new UserRegisterDto(), {
          email: "test@fpi.test",
          password: "Password!123",
        }),
      );
      expect(user).toBeInstanceOf(UserDto);
      expect(user.email).toBe("test@fpi.test");
      // @ts-expect-error password is not defined
      expect(user.password).toBeUndefined();
    });
  });
});
