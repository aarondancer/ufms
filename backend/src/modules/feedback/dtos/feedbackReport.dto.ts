import { FeedbackDto } from "./feedback.dto";

export class FeedbackReportDto {
  top!: FeedbackDto[];
  bottom!: FeedbackDto[];

  constructor(top: FeedbackDto[], bottom: FeedbackDto[]) {
    this.top = top;
    this.bottom = bottom;
  }
}
