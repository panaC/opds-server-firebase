import { IsNotEmpty
  , IsUrl
  , IsOptional
  , IsDate
  , IsISBN
  , IsString
  , IsISO8601, 
  } from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';
import * as moment from "moment";

import "reflect-metadata";

// https://github.com/readium/webpub-manifest/blob/master/schema/metadata.schema.json
export class MetadataDto {
  
  @IsOptional()
  @IsString()
  readonly identifier!: string;

  @IsOptional()
  @Expose({ name: "@type" })
  @IsUrl()
  readonly type!: string;

  @IsNotEmpty()
  @IsString()
  readonly title!: string;

  @IsOptional()
  @IsISO8601()
  @Type(() => Date)
  @Transform(value => moment(value), { toClassOnly: true })
  readonly modified!: Date;

  @IsOptional()
  @IsDate()
  @IsISO8601()
  @Type(() => Date)
  @Transform(value => moment(value), { toClassOnly: true })
  readonly published!: Date;

  @IsOptional()
  @IsISBN()
  readonly isbn!: string;
}
