import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const STATUS_FILTERS = ['all', 'novo', 'atencao', 'em_dia'] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

/** Validação é responsabilidade do controller — por isso mora no DTO. */
export class ListPatientsQuery {
  @IsOptional()
  @IsIn(STATUS_FILTERS)
  status: StatusFilter = 'all';

  @IsOptional()
  @IsString()
  @Transform(({ value }) => String(value ?? '').trim())
  search = '';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 40;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset = 0;
}
