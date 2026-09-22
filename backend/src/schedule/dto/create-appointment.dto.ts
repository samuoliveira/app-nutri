import { IsIn, IsISO8601, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  patientId!: string;

  @IsISO8601()
  startsAt!: string;

  @IsIn(['first', 'return', 'consultation'])
  kind!: 'first' | 'return' | 'consultation';

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(240)
  durationMinutes = 40;
}
