import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

import { AbstractEntity } from "../../common/abstract.entity";
import { FeatureRequestEntity } from "./featureRequest.entity";
import { FeatureUpdateType } from "./featureRequest.types";
import { UserEntity } from "../user/user.entity";

@Entity({ name: "feature_updates" })
export class FeatureUpdateEntity extends AbstractEntity {
  @Column({
    type: "enum",
    enum: FeatureUpdateType,
    nullable: false,
  })
  type!: FeatureUpdateType;

  @Column({ nullable: false, type: "varchar" })
  text!: string;

  @ManyToOne(() => FeatureRequestEntity, (fr) => fr.updates, {
    nullable: false,
    cascade: ["remove"]
  })
  @JoinColumn({ name: "feature_request_id" })
  featureRequest!: FeatureRequestEntity;

  @Column({ name: "feature_request_id", nullable: false })
  featureRequestId!: Uuid;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "created_by" })
  createdBy!: UserEntity;

  @Column({ name: "created_by", nullable: false })
  createdById!: Uuid;
}
