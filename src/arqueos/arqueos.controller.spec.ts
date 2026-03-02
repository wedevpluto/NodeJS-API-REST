import { Test, TestingModule } from '@nestjs/testing';
import { ArqueosController } from './arqueos.controller';
import { ArqueosService } from './arqueos.service';

describe('ArqueosController', () => {
  let controller: ArqueosController;

  const mockArqueosService = {
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue({ id: 1 }),
    findUltimo: jest.fn().mockResolvedValue({ id: 1 }),
    create: jest.fn().mockResolvedValue({ id: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArqueosController],
      providers: [{ provide: ArqueosService, useValue: mockArqueosService }],
    }).compile();

    controller = module.get<ArqueosController>(ArqueosController);
  });

  it('should be defined', () => expect(controller).toBeDefined());
});