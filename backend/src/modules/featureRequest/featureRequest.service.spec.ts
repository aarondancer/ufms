/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { FeatureRequestService } from "./featureRequest.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { FeatureRequestEntity } from "./featureRequest.entity";
import { NotFoundException } from "@nestjs/common";
import { FeedbackEntity } from "../feedback/feedback.entity";
import { FeatureUpdateEntity } from "./featureUpdate.entity";
import { CreateFeatureRequestDto } from "./dtos/createFeatureRequest.dto";
import {
  FeatureRequestStatus,
  FeatureUpdateType,
} from "./featureRequest.types";
import { FeatureRequestWithUpdatesDto } from "./dtos/featureRequestWithUpdates.dto";
import { FeedbackStatus } from "../feedback/feedback.types";
import { Repository } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { FeatureRequestFeedbackEntity } from "./featureRequestFeedback.entity";
import { PostCommentDto } from "./dtos/postUpdateDto";

describe("FeatureRequestService", () => {
  let service: FeatureRequestService;
  let featureRequestRepository: Repository<FeatureRequestEntity>;
  let featureUpdateRepository: Repository<FeatureUpdateEntity>;
  let feedbackRepository: Repository<FeedbackEntity>;
  let featureRequestFeedbackRepository: Repository<FeatureRequestFeedbackEntity>;
  let repositoryMock;

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
      findOneBy: jest.fn(),
      remove: jest.fn(),
      relation: jest.fn().mockReturnThis(),
      of: jest.fn().mockReturnThis(),
      add: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureRequestService,
        {
          provide: getRepositoryToken(FeatureRequestEntity),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(FeatureUpdateEntity),
          useValue: repositoryMock,
        },
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

    service = module.get<FeatureRequestService>(FeatureRequestService);
    featureRequestRepository = module.get(
      getRepositoryToken(FeatureRequestEntity),
    );
    featureUpdateRepository = module.get(
      getRepositoryToken(FeatureUpdateEntity),
    );
    feedbackRepository = module.get(getRepositoryToken(FeedbackEntity));
    featureRequestFeedbackRepository = module.get(
      getRepositoryToken(FeatureRequestFeedbackEntity),
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getOneWithUpdates", () => {
    it("should return a FeatureRequestWithUpdatesDto", async () => {
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
        createdBy: new UserEntity(),
        createdById: "9996423b-73cb-42a8-b05a-4eca28c16111",
      };

      jest
        .spyOn(featureRequestRepository, "findOne")
        .mockResolvedValue(mockFeatureRequest);

      const result = await service.getOneWithUpdates(
        "8616423b-73cb-42a8-b05a-4eca28c16101",
      );
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(FeatureRequestWithUpdatesDto);
      expect(result.id).toBe("8616423b-73cb-42a8-b05a-4eca28c16101");
    });

    it("should throw NotFoundException if feature request is not found", async () => {
      jest.spyOn(featureRequestRepository, "findOne").mockResolvedValue(null);

      await expect(service.getOneWithUpdates("some-uuid")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("create", () => {
    it("should successfully create a feature request", async () => {
      const dto = new CreateFeatureRequestDto();
      dto.setName("New Feature");
      dto.setDescription("Description of the new feature");
      dto.setFeedbackId("feedback-uuid");

      const mockFeatureRequest = new FeatureRequestEntity();
      jest
        .spyOn(featureRequestRepository, "create")
        .mockReturnValue(mockFeatureRequest);
      jest
        .spyOn(featureRequestRepository, "save")
        .mockResolvedValue(mockFeatureRequest);

      const result = await service.create(
        "9996423b-73cb-42a8-b05a-4eca28c16111",
        dto,
      );
      expect(result).toBeDefined();
      expect(featureRequestRepository.save).toHaveBeenCalledWith(
        mockFeatureRequest,
      );
    });
  });

  describe("delete", () => {
    it("should successfully delete a feature request", async () => {
      const mockFeatureRequest = new FeatureRequestEntity();
      jest
        .spyOn(featureRequestRepository, "findOneBy")
        .mockResolvedValue(mockFeatureRequest);
      jest
        .spyOn(featureRequestRepository, "delete")
        .mockResolvedValue({ affected: 1, raw: null });

      await service.delete("uuid");
      expect(featureRequestRepository.delete).toHaveBeenCalledWith({
        featureRequestId: "uuid",
      });
    });

    it("should throw NotFoundException if feature request is not found", async () => {
      jest
        .spyOn(featureUpdateRepository, "delete")
        .mockResolvedValue({ affected: 1, raw: null });
      jest
        .spyOn(featureRequestRepository, "delete")
        .mockResolvedValue({ affected: 1, raw: null });
      jest
        .spyOn(featureRequestFeedbackRepository, "delete")
        .mockResolvedValue({ affected: 1, raw: null });
      await expect(service.delete("uuid")).resolves.toBeUndefined();
      expect(featureRequestRepository.delete).toHaveBeenCalledWith({
        id: "uuid",
      });
      expect(featureUpdateRepository.delete).toHaveBeenCalledWith({
        featureRequestId: "uuid",
      });
      expect(featureRequestFeedbackRepository.delete).toHaveBeenCalledWith({
        featureRequestId: "uuid",
      });
    });
  });

  describe("associateFeedback", () => {
    it("should associate feedback with a feature request", async () => {
      const featureRequestId = "feature-uuid";
      const feedbackId = "feedback-uuid";

      const mockFeatureRequest = new FeatureRequestEntity();
      const mockFeedback = new FeedbackEntity();

      jest
        .spyOn(featureRequestRepository, "findOneBy")
        .mockResolvedValue(mockFeatureRequest);
      jest
        .spyOn(feedbackRepository, "findOneBy")
        .mockResolvedValue(mockFeedback);
      jest.spyOn(feedbackRepository, "save").mockResolvedValue(mockFeedback);

      await service.associateFeedback(
        "9996423b-73cb-42a8-b05a-4eca28c16111",
        featureRequestId,
        feedbackId,
      );

      expect(feedbackRepository.findOneBy).toHaveBeenCalledWith({
        id: feedbackId,
      });
      expect(feedbackRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: FeedbackStatus.REVIEWED }),
      );
    });

    it("should throw NotFoundException if feature request is not found", async () => {
      jest.spyOn(featureRequestRepository, "findOneBy").mockResolvedValue(null);

      await expect(
        service.associateFeedback(
          "9996423b-73cb-42a8-b05a-4eca28c16111",
          "feature-uuid",
          "feedback-uuid",
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("removeFeedback", () => {
    it("should remove feedback from a feature request", async () => {
      const featureRequestId = "feature-uuid";
      const feedbackId = "feedback-uuid";

      const mockFeatureRequest = new FeatureRequestEntity();
      const mockFeedback = new FeedbackEntity();

      jest
        .spyOn(featureRequestRepository, "findOneBy")
        .mockResolvedValue(mockFeatureRequest);
      jest
        .spyOn(feedbackRepository, "findOneBy")
        .mockResolvedValue(mockFeedback);

      await expect(
        service.removeFeedback(featureRequestId, feedbackId),
      ).resolves.toBeUndefined();

      expect(featureRequestRepository.createQueryBuilder).toHaveBeenCalled();
      expect(feedbackRepository.findOneBy).toHaveBeenCalledWith({
        id: feedbackId,
      });
    });
  });

  describe("postUpdate", () => {
    it("should post an update to a feature request", async () => {
      const featureRequestId = "feature-uuid";
      const updateType = FeatureUpdateType.COMMENT;
      const dto = new PostCommentDto();
      dto.setText("Update text");

      const mockUpdate = new FeatureUpdateEntity();

      const mockFeatureRequest = new FeatureRequestEntity();
      mockFeatureRequest.id = featureRequestId;

      jest
        .spyOn(featureUpdateRepository, "create")
        // @ts-expect-error test
        .mockResolvedValue(mockUpdate);
      jest
        .spyOn(featureRequestRepository, "findOneBy")
        .mockResolvedValue(mockFeatureRequest);
      jest.spyOn(featureUpdateRepository, "save").mockResolvedValue(mockUpdate);

      await expect(
        service.postUpdate("user-id", featureRequestId, updateType, dto),
      ).resolves.toBe(undefined);

      expect(featureUpdateRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        featureRequest: expect.objectContaining({ id: featureRequestId }),
        type: updateType,
        text: dto.getText(),
        createdById: "user-id",
      }));
      expect(featureUpdateRepository.save).toHaveBeenCalled();
    });
  });

  describe("updateStatus", () => {
    it("should update the status of a feature request", async () => {
      const featureRequestId = "feature-uuid";
      const newStatus = FeatureRequestStatus.COMPLETED;

      const mockFeatureRequest = new FeatureRequestEntity();
      const mockUpdate = new FeatureUpdateEntity();

      jest
        .spyOn(featureRequestRepository, "findOneBy")
        .mockResolvedValue(mockFeatureRequest);
      jest
        .spyOn(featureRequestRepository, "save")
        .mockResolvedValue(mockFeatureRequest);
      jest.spyOn(featureUpdateRepository, "create").mockReturnValue(mockUpdate);
      jest.spyOn(featureUpdateRepository, "save").mockResolvedValue(mockUpdate);

      await expect(
        service.updateStatus("1", featureRequestId, newStatus),
      ).resolves.toBe(undefined);

      expect(featureRequestRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: newStatus }),
      );
      expect(featureUpdateRepository.save).toHaveBeenCalled();
    });
  });
});
