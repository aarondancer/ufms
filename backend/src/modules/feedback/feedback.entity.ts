import { Column, Entity, JoinTable, ManyToMany } from "typeorm";

import { AbstractEntity } from "../../common/abstract.entity";
import { FeatureRequestEntity } from "../featureRequest/featureRequest.entity";
import { FeedbackSource, FeedbackStatus } from "./feedback.types";

@Entity({ name: "feedbacks" })
export class FeedbackEntity extends AbstractEntity {
  @Column({ nullable: false, type: "varchar" })
  email!: string;

  @Column({
    type: "enum",
    enum: FeedbackStatus,
    default: FeedbackStatus.UNREVIEWED,
    nullable: false,
  })
  status!: FeedbackStatus;

  @Column({
    type: "enum",
    enum: FeedbackSource,
    default: FeedbackSource.ONLINE_FORM,
    nullable: false,
  })
  source!: FeedbackSource;

  @Column({ nullable: false, type: "varchar" })
  ip!: string;

  @Column({ nullable: false, type: "text" })
  text!: string;

  @Column({ nullable: false, type: "decimal", default: 0 })
  sentimentScore!: number;

  @ManyToMany(
    () => FeatureRequestEntity,
    (featureRequest) => featureRequest.feedbacks,
  )
  @JoinTable({
    name: "feature_request_feedbacks",
    joinColumn: {
      name: "feedback_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "feature_request_id",
      referencedColumnName: "id",
    },
  })
  featureRequests!: FeatureRequestEntity[];
}
