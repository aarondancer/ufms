import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FeedbackEntity } from "../../modules/feedback/feedback.entity";
import { FeatureRequestController } from "./featureRequest.controller";
import { FeatureRequestEntity } from "./featureRequest.entity";
import { FeatureRequestService } from "./featureRequest.service";
import { FeatureRequestFeedbackEntity } from "./featureRequestFeedback.entity";
import { FeatureUpdateEntity } from "./featureUpdate.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FeatureRequestEntity,
      FeatureUpdateEntity,
      FeedbackEntity,
      FeatureRequestFeedbackEntity
    ]),
  ],
  controllers: [FeatureRequestController],
  exports: [FeatureRequestService],
  providers: [FeatureRequestService],
})
export class FeatureRequestModule {}
