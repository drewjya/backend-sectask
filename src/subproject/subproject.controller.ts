import { Controller, Post } from '@nestjs/common';
import { SubprojectService } from './subproject.service';

@Controller('api/subproject')
export class SubprojectController {
  constructor(private readonly subprojectService: SubprojectService) { }
  
  @Post('new')
  new() { }
  
  @Post(':subprojectId/member')
  addMember() { }


}
