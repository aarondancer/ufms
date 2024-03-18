import { validate } from "class-validator";
import { FeatureUpdateDto } from "./featureUpdateDto";
import { FeatureUpdateType } from "../featureRequest.types";
import { FeatureUpdateEntity } from "../featureUpdate.entity";
import { FeatureRequestEntity } from "../featureRequest.entity";
import { UserEntity } from "../../user/user.entity";

describe("FeatureUpdateDto", () => {
  let featureUpdateMock: FeatureUpdateEntity;

  beforeEach(() => {
    featureUpdateMock = {
      id: "8616423b-73cb-42a8-b05a-4eca28c16101",
      type: FeatureUpdateType.COMMENT,
      text: "Update text",
      featureRequestId: "8616423b-73cb-42a8-b05a-4eca28c16101",
      createdAt: new Date(),
      updatedAt: new Date(),
      featureRequest: new FeatureRequestEntity(),
      createdBy: new UserEntity(),
      createdById: "8616423b-73cb-42a8-b05a-4eca28c16101",
    };
  });

  it("should validate with correct data", async () => {
    const dto = new FeatureUpdateDto(featureUpdateMock);

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("should fail validation when type is invalid", async () => {
    featureUpdateMock.type = "invalid-type" as unknown as FeatureUpdateType;
    const dto = new FeatureUpdateDto(featureUpdateMock);

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toEqual("type");
  });

  it("should fail validation when text is missing", async () => {
    featureUpdateMock.text = "";
    const dto = new FeatureUpdateDto(featureUpdateMock);

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toEqual("text");
  });

  it("should fail validation when featureRequestId is not a valid UUID", async () => {
    featureUpdateMock.featureRequestId = "invalid-uuid";
    const dto = new FeatureUpdateDto(featureUpdateMock);

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toEqual("featureRequestId");
  });
});
