import { Test, TestingModule } from '@nestjs/testing';
import { SubprojectController } from './subproject.controller';
import { SubprojectService } from './subproject.service';

describe('SubprojectController', () => {
  let controller: SubprojectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubprojectController],
      providers: [SubprojectService],
    }).compile();

    controller = module.get<SubprojectController>(SubprojectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
