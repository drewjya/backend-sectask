import { Test, TestingModule } from '@nestjs/testing';
import { SubprojectService } from './subproject.service';

describe('SubprojectService', () => {
  let service: SubprojectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubprojectService],
    }).compile();

    service = module.get<SubprojectService>(SubprojectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
