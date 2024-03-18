import { FeedbackDto } from "../../../modules/feedback/dtos/feedback.dto";
import { FeatureRequestEntity } from "../featureRequest.entity";
import { FeatureRequestWithUpdatesDto } from "./featureRequestWithUpdates.dto";
import { FeatureUpdateDto } from "./featureUpdateDto";

export class FeatureRequestWithUpdatesAndFeedbacksDto extends FeatureRequestWithUpdatesDto {
  feedbacks!: FeedbackDto[];
  feedbackCount!: number;
  averageSentimentScore!: number | null;
  totalScore!: number;

  constructor(
    featureRequestEntity: FeatureRequestEntity & {
      feedbackCount: number;
      averageSentimentScore: string | number | null;
      totalScore: string | number;
    },
  ) {
    super(featureRequestEntity);
    this.feedbackCount = featureRequestEntity.feedbackCount;
    this.averageSentimentScore =
      featureRequestEntity.averageSentimentScore == null
        ? null
        : Number(featureRequestEntity.averageSentimentScore);
    this.totalScore = Number(featureRequestEntity.totalScore);
    this.updates = featureRequestEntity.updates.map(
      (featureUpdateEntity) => new FeatureUpdateDto(featureUpdateEntity),
    );
    this.feedbacks = featureRequestEntity.feedbacks.map(
      (feedbackEntity) => new FeedbackDto(feedbackEntity),
    );
  }
}
