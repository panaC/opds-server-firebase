
import { IsNotEmpty, ValidateNested, IsOptional, Equals } from 'class-validator';
import { MetadataDto } from './metadata.dto';
import { LinksDto } from './links.dto';
import { Expose, Type } from 'class-transformer';

import "reflect-metadata";

export class WebpubDto {

  @Expose({ name: '@context' })
  @Type(() => String)
  @IsNotEmpty()
  @Equals("https://readium.org/webpub-manifest/context.jsonld")
  readonly context!: string;

  @IsNotEmpty()
  @ValidateNested()
  readonly metadata!: MetadataDto;

  @Type(() => LinksDto)
  @IsNotEmpty()
  @ValidateNested()
  links!: LinksDto[];

  @Type(() => LinksDto)
  @IsNotEmpty()
  @ValidateNested()
  readonly readingOrder!: LinksDto[];

  @Type(() => LinksDto)
  @IsOptional()
  @ValidateNested()
  readonly resources!: LinksDto[];

  @Type(() => LinksDto)
  @IsOptional()
  @ValidateNested()
  readonly toc!: LinksDto[];
}
