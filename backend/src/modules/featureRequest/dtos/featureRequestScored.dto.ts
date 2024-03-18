import {
  NumberField
} from "../../../decorators";
import { FeatureRequestEntity } from "../featureRequest.entity";
import { FeatureRequestDto } from "./featureRequest.dto";

export class FeatureRequestScoredDto extends FeatureRequestDto {
  @NumberField({ nullable: false, required: true })
  feedbackCount!: number;

  @NumberField({ nullable: true, required: true })
  averageSentimentScore!: number | null;

  @NumberField({ nullable: false, required: true })
  totalScore!: number;

  constructor(
    featureRequest: FeatureRequestEntity & {
      feedbackCount: number;
      averageSentimentScore: number | null;
      totalScore: number;
    },
  ) {
    super(featureRequest);

    this.name = featureRequest.name;
    this.status = featureRequest.status;
    this.description = featureRequest.description;
    this.feedbackCount = featureRequest.feedbackCount;
    this.averageSentimentScore = featureRequest.averageSentimentScore;
    this.totalScore = featureRequest.totalScore;
  }
}
