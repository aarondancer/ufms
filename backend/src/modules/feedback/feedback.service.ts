import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import aposToLexForm from "apos-to-lex-form";
import { PageDto } from "common/dto/page.dto";
import { PorterStemmer, SentimentAnalyzer, WordTokenizer } from "natural";
import SpellCorrector from "spelling-corrector";
import { removeStopwords } from "stopword";
import { Repository } from "typeorm";
import { FeatureRequestFeedbackEntity } from "../featureRequest/featureRequestFeedback.entity";
import { FeedbackPageOptionsDto } from "./dtos/feedback-page-options.dto";
import { FeedbackDto } from "./dtos/feedback.dto";
import { FeedbackReportDto } from "./dtos/feedbackReport.dto";
import { FeedbackWithFeatureRequestsDto } from "./dtos/feedbackWithFeatureRequests.dto";
import { SubmitFormFeedbackDto } from "./dtos/submitFormFeedback.dto";
import { FeedbackEntity } from "./feedback.entity";

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
const spellCorrector = new SpellCorrector();
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
spellCorrector.loadDictionary();
const tokenizer = new WordTokenizer();

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(FeedbackEntity)
    private feedbackRepository: Repository<FeedbackEntity>,
    @InjectRepository(FeatureRequestFeedbackEntity)
    private featureRequestFeedbackRepository: Repository<FeatureRequestFeedbackEntity>,
  ) {}

  async getWithFeatureRequests(
    id: Uuid,
  ): Promise<FeedbackWithFeatureRequestsDto> {
    const feedback = await this.feedbackRepository
      .createQueryBuilder("feedbacks")
      .where("feedbacks.id = :id", { id })
      .leftJoinAndSelect("feedbacks.featureRequests", "featureRequests")
      .orderBy("featureRequests.created_at", "ASC")
      .getOne();

    if (!feedback) {
      throw new NotFoundException("Feedback not found");
    }

    return new FeedbackWithFeatureRequestsDto(feedback);
  }

  async getPaged(
    pageOptionsDto: FeedbackPageOptionsDto,
  ): Promise<PageDto<FeedbackDto>> {
    const queryBuilder =
      this.feedbackRepository.createQueryBuilder("feedbacks");

    if (pageOptionsDto.q) {
      queryBuilder.searchByTerm(pageOptionsDto.q, ["feedbacks.text"]);
    }

    const [items, pageMetaDto] = await queryBuilder
      .orderBy(pageOptionsDto.orderBy, pageOptionsDto.order)
      .paginate(pageOptionsDto);

    return FeedbackDto.toPageDto(items, pageMetaDto);
  }

  async create(feedback: SubmitFormFeedbackDto): Promise<FeedbackEntity> {
    const fb = this.feedbackRepository.create(feedback.toFeedbackEntity());
    const score = this.performSentimentAnalysis(feedback.getText());
    fb.sentimentScore = parseFloat(score);

    return this.feedbackRepository.save(fb);
  }

  async delete(id: Uuid) {
    await this.featureRequestFeedbackRepository.delete({
      feedbackId: id,
    });

    return this.feedbackRepository.delete({
      id,
    });
  }

  async updateStatus(id: Uuid, status: FeedbackEntity["status"]) {
    const feedback = await this.feedbackRepository.findOne({ where: { id } });

    if (!feedback) {
      throw new NotFoundException("Feedback not found");
    }

    feedback.status = status;
    return this.feedbackRepository.save(feedback);
  }

  private performSentimentAnalysis(text: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const lexed: string = aposToLexForm(text);
    const cased = lexed.toLowerCase();
    const alphaOnly = cased.replace(/[^a-zA-Z\s]+/g, "");

    const tokenized = tokenizer.tokenize(alphaOnly);
    if (tokenized === null) {
      throw new InternalServerErrorException("Unable to score feedback");
    }
    tokenized.forEach((word, index) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      tokenized[index] = spellCorrector.correct(word) as string;
    });
    const filtered = removeStopwords(tokenized);
    const analyzer = new SentimentAnalyzer("English", PorterStemmer, "afinn");

    // min: -3, max: 3
    const analysis = analyzer.getSentiment(filtered);

    // adjust the score to be between 0 and 100 and weight it
    const normalizedScore = analysis / 3;
    const a = 4;
    const expScore = Math.exp(a * Math.abs(normalizedScore)) - 1;
    const adjustedScore = normalizedScore >= 0 ? expScore : -expScore;
    const finalScore = Math.min(
      Math.max((adjustedScore * 100 + 100) / 2, 0),
      100,
    );
    Logger.log(`Sentiment analysis: ${analysis}, ${finalScore}`);
    return finalScore.toFixed(2);
  }

  async generateReport(): Promise<FeedbackReportDto> {
    const topFeedbacks = await this.feedbackRepository
      .createQueryBuilder("feedbacks")
      .where("feedbacks.created_at > NOW() - INTERVAL '30 days'")
      .orderBy("feedbacks.sentiment_score", "DESC")
      .limit(5)
      .getMany();

    const bottomFeedbacks = await this.feedbackRepository
      .createQueryBuilder("feedbacks")
      .where("feedbacks.created_at > NOW() - INTERVAL '30 days'")
      .orderBy("feedbacks.sentiment_score", "ASC")
      .limit(5)
      .getMany();

    return {
      top: FeedbackDto.toDtos(topFeedbacks),
      bottom: FeedbackDto.toDtos(bottomFeedbacks),
    };
  }
}
