/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { type UserEntity } from "modules/user/user.entity";

export function AuthUser() {
  return createParamDecorator((_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (user?.[Symbol.for("isPublic")]) {
      return;
    }

    return user as UserEntity;
  })();
}
