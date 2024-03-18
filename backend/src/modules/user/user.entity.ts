import { Column, Entity } from "typeorm";

import { AbstractEntity } from "../../common/abstract.entity";
import { RoleType } from "../../constants";

@Entity({ name: "users" })
export class UserEntity extends AbstractEntity {
  @Column({ nullable: true, type: "varchar" })
  firstName!: string | null;

  @Column({ nullable: true, type: "varchar" })
  lastName!: string | null;

  @Column({ type: "enum", enum: RoleType, default: RoleType.USER })
  role!: RoleType;

  @Column({ unique: true, nullable: true, type: "varchar" })
  email!: string | null;

  @Column({ nullable: true, type: "varchar" })
  password!: string | null;
}
