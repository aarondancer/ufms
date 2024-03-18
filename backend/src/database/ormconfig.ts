import "../boilerplate.polyfill";

import dotenv from "dotenv";
import { DataSource, type DataSourceOptions } from "typeorm";

import { UserSubscriber } from "../entity-subscribers/user-subscriber";
import { SnakeNamingStrategy } from "../snake-naming.strategy";

dotenv.config();

const ds = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  namingStrategy: new SnakeNamingStrategy(),
  subscribers: [UserSubscriber],
  entities: [
    "src/modules/**/*.entity{.ts,.js}",
    "src/modules/**/*.view-entity{.ts,.js}",
  ],
  migrations: ["src/database/migrations/*{.ts,.js}"],
  ...(process.env.NODE_ENV === "production"
    ? {
        ssl: true,
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
      }
    : null),
} as DataSourceOptions;

export const dataSource = new DataSource(ds);
