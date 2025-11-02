import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1, { message: 'Page must be at least 1' })
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must be less than 100' })
  limit: number = 10;
}
