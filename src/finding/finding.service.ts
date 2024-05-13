import { Injectable } from '@nestjs/common';
import { CreateFindingDto } from './dto/create-finding.dto';
import { UpdateFindingDto } from './dto/update-finding.dto';

@Injectable()
export class FindingService {
  create(createFindingDto: CreateFindingDto) {
    return 'This action adds a new finding';
  }

  findAll() {
    return `This action returns all finding`;
  }

  findOne(id: number) {
    return `This action returns a #${id} finding`;
  }

  update(id: number, updateFindingDto: UpdateFindingDto) {
    return `This action updates a #${id} finding`;
  }

  remove(id: number) {
    return `This action removes a #${id} finding`;
  }
}
