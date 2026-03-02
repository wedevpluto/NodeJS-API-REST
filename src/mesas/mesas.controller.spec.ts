import { Test, TestingModule } from '@nestjs/testing';
import { MesasController } from './mesas.controller';
import { MesasService } from './mesas.service';

describe('MesasController', () => {
  let controller: MesasController;

  const mockMesasService = {
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue({ id: 1 }),
    findByEstado: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({ id: 1 }),
    update: jest.fn().mockResolvedValue({ id: 1 }),
    cambiarEstado: jest.fn().mockResolvedValue({ id: 1 }),
    delete: jest.fn().mockResolvedValue({ id: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MesasController],
      providers: [{ provide: MesasService, useValue: mockMesasService }],
    }).compile();

    controller = module.get<MesasController>(MesasController);
  });

  it('should be defined', () => expect(controller).toBeDefined());
});