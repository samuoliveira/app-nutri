import { IsISO8601, IsOptional } from 'class-validator';

export class ListScheduleQuery {
  /** Sem data, o service usa o dia corrente. */
  @IsOptional()
  @IsISO8601()
  date?: string;
}
