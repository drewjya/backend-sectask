import { PartialType } from '@nestjs/swagger';
import { CreateSubprojectDto } from './create-subproject.dto';

export class UpdateSubprojectDto extends PartialType(CreateSubprojectDto) {}
