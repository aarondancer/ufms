import { validate } from "class-validator";
import { FeatureRequestEntity } from "../featureRequest.entity";
import { FeatureRequestStatus } from "../featureRequest.types";
import { FeatureRequestDto } from "./featureRequest.dto";
import { UserEntity } from "../../user/user.entity";

describe("FeatureRequestDto", () => {
  let featureRequestMock: FeatureRequestEntity;

  beforeEach(() => {
    featureRequestMock = {
      id: "8616423b-73cb-42a8-b05a-4eca28c16101",
      name: "test",
      description: "test",
      createdAt: new Date(),
      updatedAt: new Date(),
      status: FeatureRequestStatus.UNSCHEDULED,
      updates: [],
      feedbacks: [],
      createdBy: new UserEntity(),
      createdById: "5556423b-73cb-42a8-b05a-4eca28c16101",
    };
  });

  it("should validate with correct data", async () => {
    const dto = new FeatureRequestDto(featureRequestMock);

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should fail validation when name is missing", async () => {
    featureRequestMock.name = "";
    const dto = new FeatureRequestDto(featureRequestMock);

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toEqual("name");
  });

  it("should fail validation when description is missing", async () => {
    featureRequestMock.description = "";
    const dto = new FeatureRequestDto(featureRequestMock);

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toEqual("description");
  });

  it("should pass validation with any valid status", async () => {
    // eslint-disable-next-line guard-for-in
    for (const status in FeatureRequestStatus) {
      featureRequestMock.status = FeatureRequestStatus[status];
      const dto = new FeatureRequestDto(featureRequestMock);

      // eslint-disable-next-line no-await-in-loop
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    }
  });

  it("should pass validation when status is omitted", async () => {
    // @ts-expect-error test
    delete featureRequestMock.status; // Simulate optional status
    const dto = new FeatureRequestDto(featureRequestMock);

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
