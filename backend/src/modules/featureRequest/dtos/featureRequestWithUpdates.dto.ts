import { FeatureRequestEntity } from "../featureRequest.entity";
import { FeatureRequestDto } from "./featureRequest.dto";
import { FeatureUpdateDto } from "./featureUpdateDto";

export class FeatureRequestWithUpdatesDto extends FeatureRequestDto {
  updates!: FeatureUpdateDto[];

  constructor(featureRequestEntity: FeatureRequestEntity) {
    super(featureRequestEntity);
    this.name = featureRequestEntity.name;
    this.status = featureRequestEntity.status;
    this.description = featureRequestEntity.description;
    this.updates = featureRequestEntity.updates.map(
      (featureUpdateEntity) => new FeatureUpdateDto(featureUpdateEntity),
    );
  }
}
