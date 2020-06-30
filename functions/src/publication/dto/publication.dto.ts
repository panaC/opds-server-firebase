
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { MetadataDto } from './metadata.dto';
import { LinksDto } from './links.dto';
import { Type } from 'class-transformer';

import "reflect-metadata";

// https://drafts.opds.io/opds-2.0
export class PublicationDto {

  @IsNotEmpty()
  @ValidateNested()
  readonly metadata!: MetadataDto;

  @Type(() => LinksDto)
  @IsNotEmpty()
  @ValidateNested()
  links!: LinksDto[];

  @Type(() => LinksDto)
  @ValidateNested()
  navigation!: LinksDto[];

  @Type(() => PublicationDto)
  @ValidateNested()
  publications!: PublicationDto[];

  @Type(() => LinksDto)
  @ValidateNested()
  images!: LinksDto[];

  // https://drafts.opds.io/opds-2.0#14-facets
  // not realy an publicationDto
  // {
  //   "facets": [
  //     {
  //       "metadata": {
  //         "title": "Language"
  //       },
  //       "links": [
  //         {
  //           "href": "/fr", 
  //           "type": "application/opds+json", 
  //           "title": "French", 
  //           "properties": { "numberOfItems": 10 }
  //         },
  //         {
  //           "href": "/en", 
  //           "type": "application/opds+json", 
  //           "title": "English", 
  //           "properties": { "numberOfItems": 40 }
  //         },
  //         {
  //           "href": "/de", 
  //           "type": "application/opds+json", 
  //           "title": "German", 
  //           "properties": { "numberOfItems": 6 }
  //         }
  //       ]
  //     }
  //   ]
  // }
  @Type(() => PublicationDto)
  @ValidateNested()
  groups!: PublicationDto[];

}
