import { FeatureRequestDto } from "../../../modules/featureRequest/dtos/featureRequest.dto";
import { FeedbackEntity } from "../feedback.entity";
import { FeedbackDto } from "./feedback.dto";

export class FeedbackWithFeatureRequestsDto extends FeedbackDto {
  featureRequests!: FeatureRequestDto[];

  constructor(feedback: FeedbackEntity) {
    super(feedback);

    this.email = feedback.email;
    this.source = feedback.source;
    this.status = feedback.status;
    this.text = feedback.text;
    this.sentimentScore = feedback.sentimentScore;
    this.featureRequests = feedback.featureRequests.map(
      (featureRequest) => new FeatureRequestDto(featureRequest),
    );
  }
}
