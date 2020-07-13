import { IsNotEmpty
  , IsUrl
  , IsOptional
  , IsBoolean
  , IsString
  , ValidateNested
  , IsInt
  , Min
  , Max
  , IsNumber } from 'class-validator';

import "reflect-metadata";

export class LinksDto {

  @IsNotEmpty()
  @IsUrl({ require_tld: false}) // accept localhost with require_tld: false
  href!: string;

  @IsOptional()
  @IsBoolean()
  templated!: boolean;


  @IsOptional()
  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  rel!: string;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(10000)
  height!: number;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(10000)
  width!: number;

  @IsOptional()
  @IsNumber()
  duration!: number;

  @IsOptional()
  @IsNumber()
  bitrate!: number;

  @IsOptional()
  @ValidateNested()
  children!: LinksDto[];
}
