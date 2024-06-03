import { Test, TestingModule } from '@nestjs/testing';
import { VcacheService } from './vcache.service';

describe('VcacheService', () => {
  let service: VcacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VcacheService],
    }).compile();

    service = module.get<VcacheService>(VcacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
