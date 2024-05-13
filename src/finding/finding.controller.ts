import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FindingService } from './finding.service';
import { CreateFindingDto } from './dto/create-finding.dto';
import { UpdateFindingDto } from './dto/update-finding.dto';

@Controller('finding')
export class FindingController {
  constructor(private readonly findingService: FindingService) {}

  @Post()
  create(@Body() createFindingDto: CreateFindingDto) {
    return this.findingService.create(createFindingDto);
  }

  @Get()
  findAll() {
    return this.findingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.findingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFindingDto: UpdateFindingDto) {
    return this.findingService.update(+id, updateFindingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.findingService.remove(+id);
  }
}
