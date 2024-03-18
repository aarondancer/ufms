/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from "@nestjs/testing";
import { FeatureRequestController } from "./featureRequest.controller";
import { FeatureRequestService } from "./featureRequest.service";
import { FeatureRequestStatus } from "./featureRequest.types";
import { PageOptionsDto } from "../../common/dto/page-options.dto";
import { FeatureRequestScoredDto } from "./dtos/featureRequestScored.dto";
import { PageMetaDto } from "../../common/dto/page-meta.dto";
import { CreateFeatureRequestDto } from "./dtos/createFeatureRequest.dto";
import { FeatureRequestDto } from "./dtos/featureRequest.dto";
import { UserEntity } from "../user/user.entity";
import { ExecutionContext } from "@nestjs/common";
import { createMock } from "@golevelup/ts-jest";

describe("FeatureRequestController", () => {
  let controller: FeatureRequestController;
  let featureRequestService: FeatureRequestService;
  let mockExecutionContext: ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeatureRequestController],
      providers: [
        {
          provide: FeatureRequestService,
          useValue: {
            getPagedWithScores: jest.fn(),
            generateReport: jest.fn(),
            getOneWithUpdatesAndFeedback: jest.fn(),
            getOneWithUpdates: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            postUpdate: jest.fn(),
            updateStatus: jest.fn(),
            associateFeedback: jest.fn(),
            removeFeedback: jest.fn(),
          },
        },
      ],
    }).compile();
    mockExecutionContext = createMock<ExecutionContext>();
    controller = module.get<FeatureRequestController>(FeatureRequestController);
    featureRequestService = module.get<FeatureRequestService>(
      FeatureRequestService,
    );
  });

  it("should get paginated feature requests", async () => {
    const pageOptionsDto = new PageOptionsDto({});
    const mockResponse = FeatureRequestScoredDto.toPageDto(
      [
        {
          id: "8616423b-73cb-42a8-b05a-4eca28c16101",
          name: "test",
          description: "test",
          totalScore: 100,
          averageSentimentScore: 100,
          feedbackCount: 20,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: FeatureRequestStatus.UNSCHEDULED,
          updates: [],
          feedbacks: [],
        },
      ],
      new PageMetaDto({ pageOptionsDto, itemCount: 1 }),
    );
    jest
      .spyOn(featureRequestService, "getPagedWithScores")
      .mockResolvedValue(mockResponse);

    const result = await controller.getPaginatedFeatureRequest(pageOptionsDto);

    expect(featureRequestService.getPagedWithScores).toHaveBeenCalledWith(
      pageOptionsDto,
    );
    expect(result).toEqual(mockResponse);
  });

  it("should get feature request report", async () => {
    const mockReport = [
      {
        id: "8616423b-73cb-42a8-b05a-4eca28c16101",
        name: "test",
        description: "test",
        totalScore: 100,
        averageSentimentScore: 100,
        feedbackCount: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: FeatureRequestStatus.UNSCHEDULED,
        updates: [],
        feedbacks: [],
      },
    ];

    jest
      .spyOn(featureRequestService, "generateReport")
      .mockResolvedValue(mockReport);

    const result = await controller.getFeatureRequestReport();

    expect(featureRequestService.generateReport).toHaveBeenCalled();
    expect(result).toEqual(mockReport);
  });

  it("should get individual feature request", async () => {
    const userId = "some-uuid";
    const mockFeatureRequest = {
      id: "8616423b-73cb-42a8-b05a-4eca28c16101",
      name: "test",
      description: "test",
      totalScore: 100,
      averageSentimentScore: 100,
      feedbackCount: 20,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: FeatureRequestStatus.UNSCHEDULED,
      updates: [],
      feedbacks: [],
    };
    jest
      .spyOn(featureRequestService, "getOneWithUpdatesAndFeedback")
      .mockResolvedValue(mockFeatureRequest);

    const result = await controller.getFeatureRequest(userId);

    expect(
      featureRequestService.getOneWithUpdatesAndFeedback,
    ).toHaveBeenCalledWith(userId);
    expect(result).toEqual(mockFeatureRequest);
  });

  it("should create a feature request", async () => {
    const user = new UserEntity();
    const featureRequest = new CreateFeatureRequestDto();
    const mockCreatedFeatureRequest = new FeatureRequestDto({
      id: "8616423b-73cb-42a8-b05a-4eca28c16101",
      name: "test",
      description: "test",
      createdAt: new Date(),
      updatedAt: new Date(),
      status: FeatureRequestStatus.UNSCHEDULED,
      updates: [],
      feedbacks: [],
      createdBy: user,
      createdById: "some-uuid",
    });
    jest
      .spyOn(featureRequestService, "create")
      .mockResolvedValue(mockCreatedFeatureRequest);

    // @ts-expect-error mock
    mockExecutionContext.switchToHttp().getRequest.mockReturnValue({
      user,
    });

    const result = await controller.createFeatureRequest(user, featureRequest);

    expect(featureRequestService.create).toHaveBeenCalledWith(
      undefined,
      featureRequest,
    );
    expect(result).toEqual(mockCreatedFeatureRequest);
  });

  it("should delete a feature request", async () => {
    const id = "some-uuid";
    jest.spyOn(featureRequestService, "delete").mockResolvedValue();

    await expect(controller.deleteFeatureRequest(id)).resolves.toBeUndefined();

    expect(featureRequestService.delete).toHaveBeenCalledWith(id);
    expect(featureRequestService.delete).toHaveBeenCalledTimes(1);
  });
});
