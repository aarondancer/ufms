import { EnumFieldOptional } from "../../../decorators";
import { FeedbackStatus } from "../feedback.types";

export class UpdateFeedbackStatusDto {
  @EnumFieldOptional(() => FeedbackStatus, {
    nullable: false,
  })
  status!: FeedbackStatus;
}
