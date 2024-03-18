import { UserEntity } from "modules/user/user.entity";
import { RoleType } from "../../constants";

const assessmentUserId = "a76933bf-13de-4a26-be7e-3e77933b2d04" as Uuid;
const localUserId = "3954dbc4-fafb-451f-a886-1cf3c4eb9d62" as Uuid;

export const userSeeds: Omit<UserEntity, "createdAt" | "updatedAt">[] = [
  {
    id: assessmentUserId,
    firstName: "West",
    lastName: "Govern",
    role: RoleType.USER,
    email: "wgu@fpi.test",
    password: "Password123!",
  },
  {
    id: localUserId,
    firstName: "Chief",
    lastName: "Staff",
    role: RoleType.USER,
    email: "staff@fpi.test",
    password: "password",
  },
];
