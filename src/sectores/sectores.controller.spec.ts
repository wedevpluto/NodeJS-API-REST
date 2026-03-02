import { Test, TestingModule } from '@nestjs/testing';
import { SectoresController } from './sectores.controller';
import { SectoresService } from './sectores.service';

describe('SectoresController', () => {
  let controller: SectoresController;

  const mockSectoresService = {
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue({ id: 1 }),
    create: jest.fn().mockResolvedValue({ id: 1 }),
    update: jest.fn().mockResolvedValue({ id: 1 }),
    delete: jest.fn().mockResolvedValue({ id: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SectoresController],
      providers: [{ provide: SectoresService, useValue: mockSectoresService }],
    }).compile();

    controller = module.get<SectoresController>(SectoresController);
  });

  it('should be defined', () => expect(controller).toBeDefined());
});