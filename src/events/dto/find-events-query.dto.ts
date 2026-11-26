
import { Transform, Type } from 'class-transformer';

import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class FindEventsQueryDto {
  // FILTER BY CATEGORY
  @IsOptional()
  @IsString()
  category?: string;

  // FILTER BY LOCATION
  @IsOptional()
  @IsString()
  location?: string;

  // FILTER BY PUBLISH STATUS
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isPublished?: boolean;

  // SORT BY EVENT DATE OR TITLE
  @IsOptional()
  @IsIn(['eventDate', 'title'])
  sortBy?: 'eventDate' | 'title';

  // SORT ORDER
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';

  // PAGE NUMBER
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  // ITEMS PER PAGE
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
