import { EmailField, StringField } from "../../../decorators";
import { FeedbackEntity } from "../feedback.entity";
import { FeedbackSource } from "../feedback.types";

export class SubmitFormFeedbackDto {
  @EmailField({ nullable: false })
  private email!: string;

  @StringField({ nullable: false, required: true })
  private text!: string;

  private source: FeedbackSource = FeedbackSource.ONLINE_FORM;

  private ip?: string;

  getEmail(): string {
    return this.email;
  }

  getText(): string {
    return this.text;
  }

  getSource(): FeedbackSource {
    return this.source;
  }

  getIp(): string {
    return this.ip!;
  }

  setEmail(email: string): void {
    this.email = email;
  }

  setText(text: string): void {
    this.text = text;
  }

  setSource(source: FeedbackSource): void {
    this.source = source;
  }

  setIp(ip: string): void {
    this.ip = ip;
  }

  toFeedbackEntity(): Partial<FeedbackEntity> {
    return {
      email: this.email,
      text: this.text,
      source: this.source,
      ip: this.ip!,
    };
  }
}
