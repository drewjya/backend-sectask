import { ApiProperty } from '@nestjs/swagger';
import { CVSS_VALUE } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, MinDate } from 'class-validator';

export class EditFProp {
  @IsOptional()
  @ApiProperty()
  category?: string;
  @IsOptional()
  @ApiProperty()
  location?: string;
  @IsOptional()
  @ApiProperty()
  method?: string;
  @IsOptional()
  @ApiProperty()
  environment?: string;
  @IsOptional()
  @ApiProperty()
  application?: string;
  @IsOptional()
  @ApiProperty()
  impact?: string;
  @IsOptional()
  @ApiProperty()
  likelihood?: string;
}

export class EditResetsProp {
  @IsOptional()
  @ApiProperty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @MinDate(new Date())
  latestUpdate?: Date;

  //   @IsOptional()
  //   @ApiProperty()
  // tester?: string;

  @IsOptional()
  @ApiProperty()
  status?: string;

  @IsOptional()
  @ApiProperty()
  releases?: string;
}

export class EditCVSSProp {
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  av: CVSS_VALUE;
  ac: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  at: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  pr: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  ui: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  vc: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  vi: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  va: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  sc: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  si: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  sa: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  s: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  au: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  r: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  v: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  re: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  u: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  mav: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  mac: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  mat: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  mpr: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  mui: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  mvc: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  mvi: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  mva: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  msc: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  msi: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  msa: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  cr: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  ir: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  ar: CVSS_VALUE;
  @IsEnum(CVSS_VALUE)
  @ApiProperty()
  e: CVSS_VALUE;
}
