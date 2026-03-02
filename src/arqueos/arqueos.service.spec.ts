import { Test, TestingModule } from '@nestjs/testing';
import { ArqueosService } from './arqueos.service';

describe('ArqueosService', () => {
  let service: ArqueosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArqueosService],
    }).compile();

    service = module.get<ArqueosService>(ArqueosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
