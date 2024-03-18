import { CreateFeatureRequestDto } from "./createFeatureRequest.dto";
import { validate } from "class-validator";

describe("CreateFeatureRequestDto", () => {
  let dto: CreateFeatureRequestDto;

  beforeEach(() => {
    dto = new CreateFeatureRequestDto();
  });

  it("should validate with correct data", async () => {
    dto.name = "Feature Name";
    dto.description = "Feature Description";
    dto.feedbackId = "067a3ac2-ee5a-4ffb-9fb8-386879547905";

    const errors = await validate(dto);
    expect(errors).toEqual([]);
    expect(errors.length).toBe(0);
  });

  it("should fail validation when name is missing", async () => {
    dto.description = "Feature Description";

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toEqual("name");
  });

  it("should fail validation when description is missing", async () => {
    dto.name = "Feature Name";

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toEqual("description");
  });

  it("should fail validation when feedbackId is invalid UUID", async () => {
    dto.name = "Feature Name";
    dto.description = "Feature Description";
    dto.feedbackId = "invalid-uuid";

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toEqual("feedbackId");
  });

  it("should pass validation when feedbackId is omitted", async () => {
    dto.name = "Feature Name";
    dto.description = "Feature Description";

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
