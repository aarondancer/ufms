import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { snakeToCamelObject } from "../../common/utils";
import { FeedbackEntity } from "../../modules/feedback/feedback.entity";
import { FeedbackStatus } from "../../modules/feedback/feedback.types";
import { CreateFeatureRequestDto } from "./dtos/createFeatureRequest.dto";
import { FeatureRequestPageOptionsDto } from "./dtos/feature-request-page-options-dto";
import { FeatureRequestDto } from "./dtos/featureRequest.dto";
import { FeatureRequestScoredDto } from "./dtos/featureRequestScored.dto";
import { FeatureRequestWithUpdatesDto } from "./dtos/featureRequestWithUpdates.dto";
import { FeatureRequestWithUpdatesAndFeedbacksDto } from "./dtos/featureRequestWithUpdatesAndFeedbacks.dto";
import { PostCommentDto } from "./dtos/postUpdateDto";
import { FeatureRequestEntity } from "./featureRequest.entity";
import {
  FeatureRequestStatus,
  FeatureUpdateType,
} from "./featureRequest.types";
import { FeatureRequestFeedbackEntity } from "./featureRequestFeedback.entity";
import { FeatureUpdateEntity } from "./featureUpdate.entity";

const FEEDBACKS_COUNT_SQL = `COUNT(feedbacks.id)`;
const AVERAGE_SENTIMENT_SCORE_SQL = `AVG(feedbacks.sentiment_score)`;
const TOTAL_SCORE_SQL = `
CASE
  WHEN feature_requests.status IN ('COMPLETED', 'REJECTED') THEN 0
  ELSE
  (
    (EXTRACT(EPOCH FROM AGE(CURRENT_DATE, feature_requests.created_at)) / 86400 + 1)
    * POW(COUNT(feedbacks.id), 1.5)
    * LOG((100 - AVG(feedbacks.sentiment_score)) + 3)
  )
END
`;

function withScores(qb: SelectQueryBuilder<FeatureRequestEntity>) {
  const q = qb
    .leftJoin("feature_requests.feedbacks", "feedbacks")
    .addSelect("feature_requests.*")
    .addSelect(FEEDBACKS_COUNT_SQL, "feedback_count")
    .addSelect(AVERAGE_SENTIMENT_SCORE_SQL, "average_sentiment_score")
    .addSelect(TOTAL_SCORE_SQL, "total_score")
    .groupBy("feature_requests.id");

  return q;
}
@Injectable()
export class FeatureRequestService {
  constructor(
    @InjectRepository(FeatureRequestEntity)
    private featureRequestRepository: Repository<FeatureRequestEntity>,
    @InjectRepository(FeatureUpdateEntity)
    private featureUpdateRepository: Repository<FeatureUpdateEntity>,
    @InjectRepository(FeedbackEntity)
    private feedbackRepository: Repository<FeedbackEntity>,
    @InjectRepository(FeatureRequestFeedbackEntity)
    private featureRequestFeedbackRepository: Repository<FeatureRequestFeedbackEntity>,
  ) {}

  async getOneWithUpdates(id: Uuid): Promise<FeatureRequestWithUpdatesDto> {
    const entity = await this.featureRequestRepository.findOne({
      where: { id },
      relations: { updates: true },
    });

    if (!entity) {
      throw new NotFoundException("FeatureRequest not found");
    }

    return new FeatureRequestWithUpdatesDto(entity);
  }

  async getOneWithUpdatesAndFeedback(
    id: Uuid,
  ): Promise<FeatureRequestWithUpdatesAndFeedbacksDto> {
    const entity = await withScores(
      this.featureRequestRepository.createQueryBuilder("feature_requests"),
    )
      .where("feature_requests.id = :id", { id })
      .getRawOne();

    if (!entity) {
      throw new NotFoundException("FeatureRequest not found");
    }

    const [updates, feedbacks] = await Promise.all([
      this.featureUpdateRepository.find({
        where: { featureRequest: { id } },
      }),
      this.feedbackRepository.find({
        where: { featureRequests: { id } },
      }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return new FeatureRequestWithUpdatesAndFeedbacksDto(
      snakeToCamelObject({
        ...entity,
        updates,
        feedbacks,
      }),
    );
  }

  async getPagedWithScores(pageOptionsDto: FeatureRequestPageOptionsDto) {
    let orderBy = pageOptionsDto.orderBy;
    if (orderBy === "priority") {
      orderBy = "total_score";
    }
    if (orderBy === "recent") {
      orderBy = "feature_requests.created_at";
    }

    let qb =
      this.featureRequestRepository.createQueryBuilder("feature_requests");

    qb = withScores(qb).orderBy(orderBy, pageOptionsDto.order);

    if (typeof pageOptionsDto.q === "string") {
      qb.searchByTerm(pageOptionsDto.q, [
        "feature_requests.name",
        "feature_requests.description",
      ]);
    }

    const [items, pageMetaDto] = await qb
      .paginate(pageOptionsDto, { raw: true })
      .then(([result, pageMeta]) => {
        return [
          result.map((item) =>
            snakeToCamelObject({
              ...item,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              feedbackCount: Number((item as any).feedback_count),
              averageSentimentScore: Number(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                (item as any).average_sentiment_score,
              ),
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              totalScore: Number((item as any).total_score),
            }),
          ),
          pageMeta,
        ] as const;
      });

    return FeatureRequestScoredDto.toPageDto(items, pageMetaDto);
  }

  async create(
    userId: Uuid,
    dto: CreateFeatureRequestDto,
  ): Promise<FeatureRequestDto> {
    const fr = this.featureRequestRepository.create({
      name: dto.getName(),
      description: dto.getDescription(),
      createdById: userId,
    });

    await this.featureRequestRepository.save(fr);

    if (dto.getFeedbackId()) {
      await this.featureRequestFeedbackRepository.save(
        this.featureRequestFeedbackRepository.create({
          feedbackId: dto.getFeedbackId(),
          featureRequestId: fr.id,
          createdById: userId,
        }),
      );
    }

    return new FeatureRequestDto(fr);
  }

  async delete(id: Uuid): Promise<void> {
    await this.featureUpdateRepository.delete({
      featureRequestId: id,
    });

    await this.featureRequestFeedbackRepository.delete({
      featureRequestId: id,
    });

    await this.featureRequestRepository.delete({
      id,
    });
  }

  async associateFeedback(
    userId: Uuid,
    id: Uuid,
    feedbackId: Uuid,
  ): Promise<void> {
    const featureRequest = await this.featureRequestRepository.findOneBy({
      id,
    });

    if (!featureRequest) {
      throw new NotFoundException("FeatureRequest not found");
    }

    const feedback = await this.feedbackRepository.findOneBy({
      id: feedbackId,
    });

    if (!feedback) {
      throw new NotFoundException("Feedback not found");
    }

    await this.featureRequestFeedbackRepository.save(
      this.featureRequestFeedbackRepository.create({
        feedbackId,
        featureRequestId: id,
        createdById: userId,
      }),
    );

    feedback.status = FeedbackStatus.REVIEWED;
    await this.feedbackRepository.save(feedback);
  }

  async removeFeedback(id: Uuid, feedbackId: Uuid): Promise<void> {
    const featureRequest = await this.featureRequestRepository.findOneBy({
      id,
    });

    if (!featureRequest) {
      throw new NotFoundException("FeatureRequest not found");
    }

    const feedback = await this.feedbackRepository.findOneBy({
      id: feedbackId,
    });

    if (!feedback) {
      throw new NotFoundException("Feedback not found");
    }

    await this.featureRequestRepository
      .createQueryBuilder("feature_requests")
      .relation(FeatureRequestEntity, "feedbacks")
      .of(featureRequest)
      .remove(feedback);
  }

  async postUpdate(
    userId: Uuid,
    id: Uuid,
    type: FeatureUpdateType,
    dto: PostCommentDto,
  ): Promise<void> {
    const featureRequest = await this.featureRequestRepository.findOneBy({
      id,
    });

    if (!featureRequest) {
      throw new NotFoundException("FeatureRequest not found");
    }

    const update = this.featureUpdateRepository.create({
      type,
      text: dto.getText(),
      featureRequest,
      createdById: userId,
    });

    await this.featureUpdateRepository.save(update);
  }

  async updateStatus(
    userId: Uuid,
    id: Uuid,
    status: FeatureRequestStatus,
  ): Promise<void> {
    const featureRequest = await this.featureRequestRepository.findOneBy({
      id,
    });

    if (!featureRequest) {
      throw new NotFoundException("FeatureRequest not found");
    }

    const update = this.featureUpdateRepository.create({
      type: FeatureUpdateType.STATUS,
      text: `STATUS UPDATED: From ${featureRequest.status} to ${status}.`,
      createdById: userId,
    });
    update.featureRequest = featureRequest;
    featureRequest.status = status;
    await Promise.all([
      this.featureRequestRepository.save(featureRequest),
      this.featureUpdateRepository.save(update),
    ]);
  }

  async generateReport() {
    // get the top 5 highest scored feature requests that are unscheduled
    const top5 = await withScores(
      this.featureRequestRepository.createQueryBuilder("feature_requests"),
    )
      .where("feature_requests.status = :status", {
        status: FeatureRequestStatus.UNSCHEDULED,
      })
      .orderBy("total_score", "DESC")
      .limit(5)
      .getRawMany()
      .then((result) => {
        return result.map(
          (item) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            new FeatureRequestScoredDto(
              snakeToCamelObject({
                ...item,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                feedbackCount: Number(item.feedback_count),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                averageSentimentScore: Number(item.average_sentiment_score),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                totalScore: Number(item.total_score),
              }),
            ),
        );
      });

    return top5;
  }
}
