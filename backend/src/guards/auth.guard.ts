import {
  AuthGuard as NestAuthGuard,
  type IAuthGuard,
  type Type,
} from "@nestjs/passport";

export function AuthGuard(
  options?: Partial<{ isPublic: boolean }>,
): Type<IAuthGuard> {
  const strategies = ["jwt"];

  if (options?.isPublic) {
    strategies.push("public");
  }

  return NestAuthGuard(strategies);
}
