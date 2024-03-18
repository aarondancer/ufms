/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from "@nestjs/testing";
import { FeedbackService } from "./feedback.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { FeedbackEntity } from "./feedback.entity";
import { FeedbackSource, FeedbackStatus } from "./feedback.types";
import { FeedbackWithFeatureRequestsDto } from "./dtos/feedbackWithFeatureRequests.dto";
import { FeedbackDto } from "./dtos/feedback.dto";
import { FeatureRequestFeedbackEntity } from "../featureRequest/featureRequestFeedback.entity";
import { SubmitFormFeedbackDto } from "./dtos/submitFormFeedback.dto";

describe("FeedbackService", () => {
  let service: FeedbackService;
  let repositoryMock: any;

  beforeEach(async () => {
    repositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getMany: jest.fn(),
      paginate: jest.fn(),
      limit: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        {
          provide: getRepositoryToken(FeedbackEntity),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(FeatureRequestFeedbackEntity),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
  });

  it("should retrieve feedback with feature requests", async () => {
    const id = "test-uuid";
    const mockFeedback = Object.assign(new FeedbackEntity(), {
      id: "8616423b-73cb-42a8-b05a-4eca28c16101",
      ip: "1.1.1.1",
      sentimentScore: 80,
      email: "test@fpi.test",
      text: "test message",
      source: FeedbackSource.ONLINE_FORM,
      status: FeedbackStatus.REVIEWED,
      createdAt: new Date(),
      updatedAt: new Date(),
      featureRequests: [],
    });
    repositoryMock.getOne.mockResolvedValue(mockFeedback);

    const result = await service.getWithFeatureRequests(id);

    expect(repositoryMock.createQueryBuilder).toHaveBeenCalled();
    expect(repositoryMock.where).toHaveBeenCalledWith("feedbacks.id = :id", {
      id,
    });
    expect(result).toEqual(new FeedbackWithFeatureRequestsDto(mockFeedback));
    expect(result).toBeInstanceOf(FeedbackWithFeatureRequestsDto);
  });

  it("should create a feedback", async () => {
    const feedback = Object.assign(new SubmitFormFeedbackDto(), {
      ip: "1.1.1.1",
      email: "test@fpi.test",
      text: "test message",
      source: FeedbackSource.EXTERNAL,
    });

    const mockFeedbackEntity = Object.assign(new FeedbackEntity(), {
      id: "8616423b-73cb-42a8-b05a-4eca28c16101",
      ip: "1.1.1.1",
      sentimentScore: 80,
      email: "test@fpi.test",
      text: "test message",
      source: FeedbackSource.EXTERNAL,
      status: FeedbackStatus.UNREVIEWED,
      createdAt: new Date(),
      updatedAt: new Date(),
      featureRequests: [],
    });
    repositoryMock.create.mockReturnValue(mockFeedbackEntity);
    repositoryMock.save.mockResolvedValue(mockFeedbackEntity);

    const result = await service.create(feedback);

    expect(repositoryMock.create).toHaveBeenCalledWith(feedback);
    expect(repositoryMock.save).toHaveBeenCalledWith(mockFeedbackEntity);
    expect(result).toEqual(mockFeedbackEntity);
    expect(result).toBeInstanceOf(FeedbackEntity);
  });

  it("should delete feedback", async () => {
    const id = "test-uuid";
    repositoryMock.delete.mockResolvedValue({ affected: 1 });

    expect(await service.delete(id)).toEqual({ affected: 1 });

    expect(repositoryMock.delete).toHaveBeenCalledWith({ id });
  });

  it("should update the status of a feedback", async () => {
    const id = "test-uuid";
    const status = FeedbackStatus.REVIEWED;
    const mockFeedback = {
      id: "8616423b-73cb-42a8-b05a-4eca28c16101",
      ip: "1.1.1.1",
      sentimentScore: 80,
      email: "test@fpi.test",
      text: "test message",
      source: FeedbackSource.EXTERNAL,
      status: FeedbackStatus.UNREVIEWED,
      createdAt: new Date(),
      updatedAt: new Date(),
      featureRequests: [],
    };
    repositoryMock.findOne.mockResolvedValue(mockFeedback);

    await service.updateStatus(id, status);

    expect(repositoryMock.findOne).toHaveBeenCalledWith({ where: { id } });
    expect(mockFeedback.status).toBe(status);
    expect(repositoryMock.save).toHaveBeenCalledWith(mockFeedback);
  });

  it("should generate a feedback report", async () => {
    const topFeedbacks = [
      {
        id: "8616423b-73cb-42a8-b05a-4eca28c16101",
        ip: "1.1.1.1",
        sentimentScore: 80,
        email: "test@fpi.test",
        text: "test message",
        source: FeedbackSource.EXTERNAL,
        status: FeedbackStatus.UNREVIEWED,
        createdAt: new Date(),
        updatedAt: new Date(),
        featureRequests: [],
      },
    ];
    const bottomFeedbacks = [
      {
        id: "5516423b-73cb-42a8-b05a-4eca28c16101",
        ip: "1.1.1.2",
        sentimentScore: 20,
        email: "test2@fpi.test",
        text: "test message bad",
        source: FeedbackSource.EXTERNAL,
        status: FeedbackStatus.UNREVIEWED,
        createdAt: new Date(),
        updatedAt: new Date(),
        featureRequests: [],
      },
    ];
    repositoryMock.getMany
      .mockResolvedValueOnce(topFeedbacks)
      .mockResolvedValueOnce(bottomFeedbacks);

    const report = await service.generateReport();

    expect(repositoryMock.createQueryBuilder).toHaveBeenCalledTimes(2);
    expect(report).toEqual({
      top: FeedbackDto.toDtos(topFeedbacks),
      bottom: FeedbackDto.toDtos(bottomFeedbacks),
    });
    expect(report.top).toHaveLength(1);
    expect(report.bottom).toHaveLength(1);
    expect(report.top[0]).toBeInstanceOf(FeedbackDto);
    expect(report.bottom[0]).toBeInstanceOf(FeedbackDto);
  });

  describe("should perform sentiment analysis", () => {
    function makeFeedback(text: string) {


      const feedback = new SubmitFormFeedbackDto();
      feedback.setIp("1.1.1.1");
      feedback.setText(text);
      feedback.setEmail("email@email.com");
      feedback.setSource(FeedbackSource.ONLINE_FORM);

      const entity = feedback.toFeedbackEntity();

      repositoryMock.create.mockImplementation(
        () => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return entity;
        },
      );
      repositoryMock.save.mockImplementation(
        () => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return entity;
        },
      );
      return feedback;
    }

    it("should provide a sentiment score for a negative feedback", async () => {

      const negative =
        "I recently tried out this app, and I must say I'm quite disappointed. The user interface is clunky, and it crashed on me multiple times during use. The customer support was unresponsive when I reached out for assistance, and overall, it felt like a frustrating experience. I wouldn't recommend it in its current state.";
      const negativeScore = await service.create(makeFeedback(negative));
      expect(negativeScore.sentimentScore).toBe(37.08);
    });

    it("should provide a sentiment score for a positive feedback", async () => {
      const positive =
        "I've been using this app for a while now, and I'm extremely pleased with it. The user interface is sleek and intuitive, making it a joy to navigate. It's also incredibly stable, and I've never experienced any crashes. The customer support is top-notch, always quick to address any questions or issues. This app has significantly improved my daily routine, and I highly recommend it.";
      const positiveScore = await service.create(makeFeedback(positive));
      expect(positiveScore.sentimentScore).toBe(89.10);
    });

    it("should provide a sentiment score for a neutral feedback", async () => {
      const neutral =
        "This app is decent and gets the job done. It has a straightforward user interface, and I haven't encountered any major issues with it. While it doesn't particularly stand out, it also hasn't disappointed me. It's a functional tool for what I need, but it doesn't have any exceptional features that would make me overly enthusiastic about it.";
      const neutralScore = await service.create(makeFeedback(neutral));
      expect(neutralScore.sentimentScore).toBe(47.47);
    });

    it("should provide a sentiment score for a mixed feedback", async () => {
      const mixed =
        "I have mixed feelings about this app. On one hand, it offers some great features that have improved my productivity. However, it can be quite glitchy at times, which can be frustrating. The user interface is nice, but the occasional bugs and crashes take away from the overall experience. Customer support is hit or miss, as they've been helpful on some occasions but not on others. It has potential, but it needs some refinement to be consistently reliable.";
      const neutralScore = await service.create(makeFeedback(mixed));
      expect(neutralScore.sentimentScore).toBe(53.74);
    });

    it("should provide a sentiment score for a very positive feedback", async () => {
      const veryPositive =
        "I'm extremely pleased with this app, I love it!. The user interface is excellent and intuitive, making it a joy to navigate. It's also incredibly stable, and I've never experienced any crashes. The customer support is really good, always quick to address any questions or issues. This app has significantly improved my daily routine, and I highly recommend it.";
      const veryPositiveScore = await service.create(
        makeFeedback(veryPositive),
      );
      expect(veryPositiveScore.sentimentScore).toBe(100);
    });

    it("should provide a sentiment score for a very negative feedback", async () => {
      const veryNegative =
        "This app is terrible and I've very disappointed. The user interface is clunky and ugly, and it crashed on me multiple times during use which made me frustrated and angry. The customer support was unresponsive when I reached out, and overall, it felt like a very bad experience. I very much dislike it in its current state.";
      const veryNegativeScore = await service.create(
        makeFeedback(veryNegative),
      );
      expect(veryNegativeScore.sentimentScore).toBe(0);
    });
  });
});
