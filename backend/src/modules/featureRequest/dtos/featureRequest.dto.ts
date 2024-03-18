import { AbstractDto } from "../../../common/dto/abstract.dto";
import { EnumFieldOptional, StringField } from "../../../decorators";
import { FeatureRequestEntity } from "../featureRequest.entity";
import { FeatureRequestStatus } from "../featureRequest.types";

export class FeatureRequestDto extends AbstractDto {
  @StringField({ nullable: false, required: true })
  name!: string;

  @EnumFieldOptional(() => FeatureRequestStatus, {
    nullable: false,
  })
  status!: FeatureRequestStatus;

  @StringField({ nullable: false, required: true })
  description!: string;

  constructor(featureRequest: FeatureRequestEntity) {
    super(featureRequest);

    Object.assign(this, featureRequest);
  }
}
