import { Test, TestingModule } from '@nestjs/testing';
import { SectoresController } from './sectores.controller';
import { SectoresService } from './sectores.service';

describe('SectoresController', () => {
  let controller: SectoresController;

  const mockSectoresService = {
    findAll:  jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue({ id: 1 }),
    create:   jest.fn().mockResolvedValue({ id: 1 }),
    update:   jest.fn().mockResolvedValue({ id: 1 }),
    delete:   jest.fn().mockResolvedValue({ id: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SectoresController],
      providers: [{ provide: SectoresService, useValue: mockSectoresService }],
    }).compile();

    controller = module.get<SectoresController>(SectoresController);
    jest.clearAllMocks();
  });

  it('should be defined', () => expect(controller).toBeDefined());

  it('findAll deberia llamar al service', async () => {
    await controller.findAll();
    expect(mockSectoresService.findAll).toHaveBeenCalled();
  });

  it('findById deberia llamar al service con el id', async () => {
    await controller.findById('1');
    expect(mockSectoresService.findById).toHaveBeenCalledWith(1);
  });

  it('create deberia llamar al service con el dto', async () => {
    const dto = { nombre: 'Salón principal' };
    await controller.create(dto);
    expect(mockSectoresService.create).toHaveBeenCalledWith(dto);
  });

  it('update deberia llamar al service con id y dto', async () => {
    const dto = { nombre: 'Salón VIP' };
    await controller.update('1', dto);
    expect(mockSectoresService.update).toHaveBeenCalledWith(1, dto);
  });

  it('delete deberia llamar al service con el id', async () => {
    await controller.delete('1');
    expect(mockSectoresService.delete).toHaveBeenCalledWith(1);
  });
});