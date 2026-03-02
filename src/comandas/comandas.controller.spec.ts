import { Test, TestingModule } from '@nestjs/testing';
import { ComandasController } from './comandas.controller';
import { ComandasService } from './comandas.service';

describe('ComandasController', () => {
  let controller: ComandasController;

  const mockComandasService = {
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue({ id: 1 }),
    findAbiertas: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({ id: 1 }),
    cerrar: jest.fn().mockResolvedValue({ id: 1 }),
    cancelar: jest.fn().mockResolvedValue({ id: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComandasController],
      providers: [{ provide: ComandasService, useValue: mockComandasService }],
    }).compile();

    controller = module.get<ComandasController>(ComandasController);
  });

  it('should be defined', () => expect(controller).toBeDefined());
});