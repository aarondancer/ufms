import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from "typeorm";

import { AbstractEntity } from "../../common/abstract.entity";
import { FeedbackEntity } from "../feedback/feedback.entity";
import { UserEntity } from "../user/user.entity";
import { FeatureRequestStatus } from "./featureRequest.types";
import { FeatureUpdateEntity } from "./featureUpdate.entity";

@Entity({ name: "feature_requests" })
export class FeatureRequestEntity extends AbstractEntity {
  @Column({ nullable: false, type: "varchar" })
  name!: string;

  @Column({
    type: "enum",
    enum: FeatureRequestStatus,
    default: FeatureRequestStatus.UNSCHEDULED,
    nullable: false,
  })
  status!: FeatureRequestStatus;

  @Column({ nullable: false, type: "text" })
  description!: string;

  @ManyToMany(() => FeedbackEntity, (feedback) => feedback.featureRequests)
  feedbacks!: FeedbackEntity[];

  @OneToMany(
    () => FeatureUpdateEntity,
    (featureUpdate) => featureUpdate.featureRequest,
  )
  updates!: FeatureUpdateEntity[];

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "created_by" })
  createdBy!: UserEntity;

  @Column({ name: "created_by", nullable: false })
  createdById!: Uuid;
}
