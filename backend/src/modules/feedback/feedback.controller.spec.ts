/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { PageOptionsDto } from "../../common/dto/page-options.dto";
import { FeatureRequestEntity } from "../featureRequest/featureRequest.entity";
import { FeedbackDto } from "./dtos/feedback.dto";
import { FeedbackWithFeatureRequestsDto } from "./dtos/feedbackWithFeatureRequests.dto";
import { FeedbackController } from "./feedback.controller";
import { FeedbackService } from "./feedback.service";
import { FeedbackSource, FeedbackStatus } from "./feedback.types";
import { SubmitFormFeedbackDto } from "./dtos/submitFormFeedback.dto";

describe("FeedbackController", () => {
  let controller: FeedbackController;
  let feedbackService: FeedbackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackController],
      providers: [
        {
          provide: FeedbackService,
          useValue: {
            create: jest.fn(),
            getPaged: jest.fn(),
            generateReport: jest.fn(),
            getWithFeatureRequests: jest.fn(),
            updateStatus: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FeedbackController>(FeedbackController);
    feedbackService = module.get<FeedbackService>(FeedbackService);
  });

  it("should submit feedback", async () => {
    const ip = "127.0.0.1";
    const mockFeedback: SubmitFormFeedbackDto = Object.assign(new SubmitFormFeedbackDto(), {
      email: "test@fpi.test",
      text: "test message",
      source: FeedbackSource.ONLINE_FORM,
    });
    feedbackService.create = jest.fn().mockResolvedValueOnce(undefined);

    await controller.submitFeedback(ip, mockFeedback);

    expect(feedbackService.create).toHaveBeenCalledWith({
      ...mockFeedback,
      ip,
    });
  });

  it("should get paginated feedback", async () => {
    const mockPageOptionsDto = new PageOptionsDto({});
    const mockResponse = FeedbackDto.toDtos([
      {
        id: "8616423b-73cb-42a8-b05a-4eca28c16101",
        email: "test@fpi.test",
        text: "test message",
        source: FeedbackSource.ONLINE_FORM,
        status: FeedbackStatus.REVIEWED,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    jest.spyOn(feedbackService, "getPaged").mockResolvedValue(mockResponse);

    const result = await controller.getPaginatedFeedback(mockPageOptionsDto);

    expect(result).toEqual(mockResponse);
    expect(result[0]).toBeInstanceOf(FeedbackDto);
    expect(feedbackService.getPaged).toHaveBeenCalledWith(mockPageOptionsDto);
    expect(feedbackService.getPaged).toHaveBeenCalledTimes(1);
  });

  it("should get feedback report", async () => {
    const mockReport = { top: [], bottom: [] };
    jest.spyOn(feedbackService, "generateReport").mockResolvedValue(mockReport);

    const result = await controller.getFeedbackReport();

    expect(result).toEqual(mockReport);
  });

  it("should get individual feedback", async () => {
    const userId = "some-uuid";
    const mockFeedback = new FeedbackWithFeatureRequestsDto({
      id: "8616423b-73cb-42a8-b05a-4eca28c16101",
      ip: "1.1.1.1",
      sentimentScore: 80,
      email: "test@fpi.test",
      text: "test message",
      source: FeedbackSource.ONLINE_FORM,
      status: FeedbackStatus.REVIEWED,
      createdAt: new Date(),
      updatedAt: new Date(),
      featureRequests: [new FeatureRequestEntity()],
    });
    jest
      .spyOn(feedbackService, "getWithFeatureRequests")
      .mockResolvedValue(mockFeedback);

    const result = await controller.getFeedback(userId);

    expect(result).toEqual(mockFeedback);
  });

  it("should update feedback status", async () => {
    const userId = "some-uuid";
    const statusUpdateDto = { status: FeedbackStatus.REVIEWED };
    jest.spyOn(feedbackService, "updateStatus").mockImplementation(jest.fn());

    await controller.updateStatus(userId, statusUpdateDto);

    expect(feedbackService.updateStatus).toHaveBeenCalledWith(
      userId,
      statusUpdateDto.status,
    );
  });

  it("should delete feedback", async () => {
    const feedbackId = "some-uuid";
    jest.spyOn(feedbackService, "delete").mockImplementation(jest.fn());

    await controller.deleteFeedback(feedbackId);

    expect(feedbackService.delete).toHaveBeenCalledWith(feedbackId);
  });
});
