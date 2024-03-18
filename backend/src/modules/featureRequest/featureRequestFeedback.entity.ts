import { Entity, ManyToOne, JoinColumn, Column, PrimaryColumn } from "typeorm";
import { FeedbackEntity } from "../feedback/feedback.entity";
import { FeatureRequestEntity } from "./featureRequest.entity";
import { UserEntity } from "../user/user.entity";

@Entity({ name: "feature_request_feedbacks" })
export class FeatureRequestFeedbackEntity {
  @PrimaryColumn({ name: "feedback_id" })
  feedbackId!: Uuid;

  @PrimaryColumn({ name: "feature_request_id" })
  featureRequestId!: Uuid;

  @ManyToOne(() => FeedbackEntity, (feedback) => feedback.featureRequests)
  @JoinColumn({ name: "feedback_id" })
  feedback!: FeedbackEntity;

  @ManyToOne(
    () => FeatureRequestEntity,
    (featureRequest) => featureRequest.feedbacks,
  )
  @JoinColumn({ name: "feature_request_id" })
  featureRequest!: FeatureRequestEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "created_by_id" })
  createdBy!: UserEntity;

  @Column({ name: "created_by_id", nullable: false })
  createdById!: Uuid;
}
