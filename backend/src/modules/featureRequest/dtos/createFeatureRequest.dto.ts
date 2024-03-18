import { StringField, UUIDFieldOptional } from "../../../decorators";

export class CreateFeatureRequestDto {
  @StringField({ nullable: false, required: true })
  private name!: string;

  @StringField({ nullable: false, required: true })
  private description!: string;

  @UUIDFieldOptional()
  private feedbackId?: Uuid;

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  getDescription(): string {
    return this.description;
  }

  setDescription(description: string): void {
    this.description = description;
  }

  getFeedbackId(): Uuid | undefined {
    return this.feedbackId;
  }

  setFeedbackId(feedbackId: Uuid): void {
    this.feedbackId = feedbackId;
  }
}
