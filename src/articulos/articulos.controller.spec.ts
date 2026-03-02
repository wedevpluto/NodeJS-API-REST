import { Test, TestingModule } from '@nestjs/testing';
import { ArticulosController } from './articulos.controller';
import { ArticulosService } from './articulos.service';

describe('ArticulosController', () => {
  let controller: ArticulosController;

  const mockArticulosService = {
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue({ id: 1 }),
    create: jest.fn().mockResolvedValue({ id: 1 }),
    update: jest.fn().mockResolvedValue({ id: 1 }),
    toggleDisponible: jest.fn().mockResolvedValue({ id: 1 }),
    delete: jest.fn().mockResolvedValue({ id: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticulosController],
      providers: [{ provide: ArticulosService, useValue: mockArticulosService }],
    }).compile();

    controller = module.get<ArticulosController>(ArticulosController);
  });

  it('should be defined', () => expect(controller).toBeDefined());
});