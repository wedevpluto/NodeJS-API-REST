import { Test, TestingModule } from '@nestjs/testing';
import { ArticulosService } from './articulos.service';

describe('ArticulosService', () => {
  let service: ArticulosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArticulosService],
    }).compile();

    service = module.get<ArticulosService>(ArticulosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
