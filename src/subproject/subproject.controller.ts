import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubprojectService } from './subproject.service';
import { CreateSubprojectDto } from './dto/create-subproject.dto';
import { UpdateSubprojectDto } from './dto/update-subproject.dto';

@Controller('subproject')
export class SubprojectController {
  constructor(private readonly subprojectService: SubprojectService) {}

  @Post()
  create(@Body() createSubprojectDto: CreateSubprojectDto) {
    return this.subprojectService.create(createSubprojectDto);
  }

  @Get()
  findAll() {
    return this.subprojectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subprojectService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubprojectDto: UpdateSubprojectDto) {
    return this.subprojectService.update(+id, updateSubprojectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subprojectService.remove(+id);
  }
}
