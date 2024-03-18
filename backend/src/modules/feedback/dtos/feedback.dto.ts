import { AbstractDto } from "../../../common/dto/abstract.dto";
import {
  EmailField,
  EnumFieldOptional,
  NumberField,
  StringField,
} from "../../../decorators";
import { FeedbackEntity } from "../feedback.entity";
import { FeedbackSource, FeedbackStatus } from "../feedback.types";

export class FeedbackDto extends AbstractDto {
  @EmailField({ nullable: false })
  email!: string;

  @EnumFieldOptional(() => FeedbackSource, {
    nullable: false,
  })
  source!: FeedbackSource;

  @EnumFieldOptional(() => FeedbackStatus, {
    nullable: false,
  })
  status!: FeedbackStatus;

  @StringField({ nullable: false, required: true })
  text!: string;

  @NumberField({ nullable: false, required: true })
  sentimentScore!: number;

  constructor(feedback: FeedbackEntity) {
    super(feedback);

    this.email = feedback.email;
    this.source = feedback.source;
    this.status = feedback.status;
    this.text = feedback.text;
    this.sentimentScore = feedback.sentimentScore;
  }
}
