import { UUIDField } from "../../../decorators";

export class AssignFeedbackToFeatureRequestDto {
  @UUIDField({ nullable: false, required: true })
  private feedbackId!: Uuid;

  getFeedbackId(): Uuid {
    return this.feedbackId;
  }

  setFeedbackId(feedbackId: Uuid): void {
    this.feedbackId = feedbackId;
  }
}
