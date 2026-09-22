import { IsIn, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsInt()
  @Min(0)
  @Max(130)
  ageYears!: number;

  @IsIn(['F', 'M'])
  sex!: 'F' | 'M';

  @IsNumber()
  @Min(0.4)
  @Max(2.5)
  heightM!: number;

  @IsNumber()
  @Min(1)
  @Max(400)
  weightKg!: number;

  @IsOptional()
  @IsString()
  lastVisitAt?: string;
}
