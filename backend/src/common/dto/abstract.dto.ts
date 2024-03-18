import { DateField, UUIDField } from "../../decorators";
import { type AbstractEntity } from "../abstract.entity";
import { PageMetaDto } from "./page-meta.dto";
import { PageDto } from "./page.dto";

type AbstractDtoType = typeof AbstractDto;

type OptionsType<Dto extends AbstractDtoType> = ConstructorParameters<Dto>[1];

export type DefaultOptions = { excludeFields?: boolean };

export class AbstractDto {
  @UUIDField()
  id!: Uuid;

  @DateField()
  createdAt!: Date;

  @DateField()
  updatedAt!: Date;

  constructor(entity: AbstractEntity, options?: DefaultOptions) {
    if (!options?.excludeFields) {
      this.id = entity.id;
      this.createdAt = entity.createdAt;
      this.updatedAt = entity.updatedAt;

      // TODO: FIXME: entity does not have createdAt
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!this.createdAt) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.createdAt = (entity as any).created_at;
      }
    }
  }

  static createDto<
    U extends typeof AbstractDto,
    T extends typeof AbstractEntity,
  >(
    this: U,
    instanceToConvert: InstanceType<T>,
    options?: ConstructorParameters<U>[1],
  ): InstanceType<U> {
    return Reflect.construct(this, [
      instanceToConvert,
      options,
    ]) as InstanceType<U>;
  }

  /**
   * Converts array of entities to array of a DTO class
   */
  static toDtos<U extends typeof AbstractDto, T extends AbstractEntity>(
    this: U,
    items: T[],
    options?: OptionsType<U>,
  ): InstanceType<U>[] {
    return items.map((item): InstanceType<U> => this.createDto(item, options));
  }

  /**
   * Converts array of entities to PageDto
   */
  static toPageDto<
    U extends typeof AbstractDto,
    T extends AbstractEntity = AbstractEntity,
  >(
    this: U,
    items: T[],
    pageMetaDto: PageMetaDto,
    options?: OptionsType<U>,
  ): PageDto<InstanceType<U>> {
    return new PageDto<InstanceType<U>>(
      this.toDtos(items, options),
      pageMetaDto,
    );
  }
}
