import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { AtLeastOneFieldNotEmpty } from 'src/utils/validator/atleast_one_validator';

export class EditFindingDto {
  @IsOptional()
  @ApiProperty()
  risk?: string;

  @IsOptional()
  @ApiProperty()
  name?: string;

  @AtLeastOneFieldNotEmpty(['risk', 'name'], {
    message: 'Either risk or name must be provided.',
  })
  atLeastOneFieldNotEmpty: true;
}
