
import { IsNotEmpty, ValidateNested, IsOptional } from 'class-validator';
import { MetadataDto } from './metadata.dto';
import { LinksDto } from './links.dto';
import { Type } from 'class-transformer';

import "reflect-metadata";

export class PublicationDto {

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
