import { AbstractDto } from "../../../common/dto/abstract.dto";
import { EnumFieldOptional, StringField, UUIDField } from "../../../decorators";
import { FeatureUpdateType } from "../featureRequest.types";
import { FeatureUpdateEntity } from "../featureUpdate.entity";

export class FeatureUpdateDto extends AbstractDto {
  @EnumFieldOptional(() => FeatureUpdateType, {
    nullable: false,
  })
  type!: FeatureUpdateType;

  @StringField({ nullable: false, required: true })
  text!: string;

  @UUIDField({ nullable: false, required: true })
  featureRequestId!: Uuid;

  constructor(featureUpdate: FeatureUpdateEntity) {
    super(featureUpdate);

    this.type = featureUpdate.type;
    this.text = featureUpdate.text;
    this.featureRequestId = featureUpdate.featureRequestId;
  }
}
