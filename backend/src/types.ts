import { type Request } from "express";
import { type UserEntity } from "modules/user/user.entity";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Constructor<T = any, Arguments extends unknown[] = any[]> = new (
  ...arguments_: Arguments
) => T;

export type KeyOfType<Entity, U> = {
  [P in keyof Required<Entity>]: Required<Entity>[P] extends U
    ? P
    : Required<Entity>[P] extends U[]
    ? P
    : never;
}[keyof Entity];

export type ContextRequest = Request & {
  user?: UserEntity;
};
