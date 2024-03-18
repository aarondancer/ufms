import "source-map-support/register";

import { Brackets, SelectQueryBuilder, type ObjectLiteral } from "typeorm";

import { type AbstractEntity } from "./common/abstract.entity";
import { PageMetaDto } from "./common/dto/page-meta.dto";
import { type PageOptionsDto } from "./common/dto/page-options.dto";
import { type KeyOfType } from "./types";
import { removeStopwords } from "stopword";

declare global {
  export type Uuid = string & { _uuidBrand: undefined };
}

declare module "typeorm" {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface SelectQueryBuilder<Entity> {
    searchByString(
      q: string,
      columnNames: string[],
      options?: {
        formStart: boolean;
      },
    ): this;

    searchByTerm(term: string, columnNames: string[]): this;

    paginate(
      this: SelectQueryBuilder<Entity>,
      pageOptionsDto: PageOptionsDto,
      options?: Partial<{
        takeAll?: boolean;
        skipCount?: boolean;
        raw?: boolean;
      }>,
    ): Promise<[Entity[], PageMetaDto]>;

    leftJoinAndSelect<AliasEntity extends AbstractEntity, A extends string>(
      this: SelectQueryBuilder<Entity>,
      property: `${A}.${Exclude<
        KeyOfType<AliasEntity, AbstractEntity>,
        symbol
      >}`,
      alias: string,
      condition?: string,
      parameters?: ObjectLiteral,
    ): this;

    leftJoin<AliasEntity extends AbstractEntity, A extends string>(
      this: SelectQueryBuilder<Entity>,
      property: `${A}.${Exclude<
        KeyOfType<AliasEntity, AbstractEntity>,
        symbol
      >}`,
      alias: string,
      condition?: string,
      parameters?: ObjectLiteral,
    ): this;

    innerJoinAndSelect<AliasEntity extends AbstractEntity, A extends string>(
      this: SelectQueryBuilder<Entity>,
      property: `${A}.${Exclude<
        KeyOfType<AliasEntity, AbstractEntity>,
        symbol
      >}`,
      alias: string,
      condition?: string,
      parameters?: ObjectLiteral,
    ): this;

    innerJoin<AliasEntity extends AbstractEntity, A extends string>(
      this: SelectQueryBuilder<Entity>,
      property: `${A}.${Exclude<
        KeyOfType<AliasEntity, AbstractEntity>,
        symbol
      >}`,
      alias: string,
      condition?: string,
      parameters?: ObjectLiteral,
    ): this;
  }
}

SelectQueryBuilder.prototype.searchByString = function (
  q,
  columnNames,
  options,
) {
  if (!q) {
    return this;
  }

  this.andWhere(
    new Brackets((qb) => {
      for (const item of columnNames) {
        qb.orWhere(`${item} ILIKE :q`);
      }
    }),
  );

  if (options?.formStart) {
    this.setParameter("q", `${q}%`);
  } else {
    this.setParameter("q", `%${q}%`);
  }

  return this;
};

SelectQueryBuilder.prototype.searchByTerm = function (term, columnNames) {
  const words = removeStopwords(
    term.split(" ").filter((word) => word.length !== 0),
  );

  if (words.length === 0) {
    return this;
  }

  this.andWhere(
    new Brackets((qb) => {
      for (let i = 0; i < words.length; i++) {
        qb.orWhere(
          `(${columnNames
            .map((columnName) => `${columnName} ILIKE :term${i}`)
            .join(" OR ")})`,
          { [`term${i}`]: `%${words[i]}%` },
        );
      }
    }),
  );

  return this;
};

SelectQueryBuilder.prototype.paginate = async function (
  pageOptionsDto: PageOptionsDto,
  options?: Partial<{
    skipCount?: boolean;
    takeAll?: boolean;
    raw?: boolean;
  }>,
) {
  if (!options?.takeAll) {
    // skip and take do not work with joins in TypeORM
    this.offset(pageOptionsDto.skip).limit(pageOptionsDto.take);
  }

  const entities = await (options?.raw ? this.getRawMany() : this.getMany());

  let itemCount = -1;

  if (!options?.skipCount) {
    itemCount = await this.getCount();
  }

  const pageMetaDto = new PageMetaDto({
    itemCount,
    pageOptionsDto,
  });

  return [entities, pageMetaDto];
};
