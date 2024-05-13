import { Injectable } from '@nestjs/common';
import { CreateSubprojectDto } from './dto/create-subproject.dto';
import { UpdateSubprojectDto } from './dto/update-subproject.dto';

@Injectable()
export class SubprojectService {
  create(createSubprojectDto: CreateSubprojectDto) {
    return 'This action adds a new subproject';
  }

  findAll() {
    return `This action returns all subproject`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subproject`;
  }

  update(id: number, updateSubprojectDto: UpdateSubprojectDto) {
    return `This action updates a #${id} subproject`;
  }

  remove(id: number) {
    return `This action removes a #${id} subproject`;
  }
}
