import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FeedbackController } from "./feedback.controller";
import { FeedbackEntity } from "./feedback.entity";
import { FeedbackService } from "./feedback.service";
import { FeatureRequestFeedbackEntity } from "../featureRequest/featureRequestFeedback.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([FeedbackEntity, FeatureRequestFeedbackEntity]),
  ],
  controllers: [FeedbackController],
  exports: [FeedbackService],
  providers: [FeedbackService],
})
export class FeedbackModule {}
