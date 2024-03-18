import { EnumFieldOptional } from "../../../decorators";
import { FeatureRequestStatus } from "../featureRequest.types";

export class UpdateFeatureRequestStatusDto {
  @EnumFieldOptional(() => FeatureRequestStatus, {
    nullable: false,
  })
  private status!: FeatureRequestStatus;

  getStatus(): FeatureRequestStatus {
    return this.status;
  }

  setStatus(status: FeatureRequestStatus): void {
    this.status = status;
  }
}
