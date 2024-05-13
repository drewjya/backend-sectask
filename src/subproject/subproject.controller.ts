import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateSubprojectDto } from './dto/create-subproject.dto';
import { UpdateSubprojectDto } from './dto/update-subproject.dto';
import { SubprojectService } from './subproject.service';

@Controller('subproject')
export class SubprojectController {
  constructor(private readonly subprojectService: SubprojectService) {}

  @Post()
  create(@Body() createSubprojectDto: CreateSubprojectDto) {}

  @Get()
  findAll() {}

  @Get(':id')
  findOne(@Param('id') id: string) {}

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubprojectDto: UpdateSubprojectDto,
  ) {}

  @Delete(':id')
  remove(@Param('id') id: string) {}
}
