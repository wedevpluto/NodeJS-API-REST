import { Test, TestingModule } from '@nestjs/testing';
import { MesasController } from './mesas.controller';
import { MesasService } from './mesas.service';
import { EstadoMesa } from '@prisma/client';

describe('MesasController', () => {
  let controller: MesasController;

  const mockMesasService = {
    findAll:      jest.fn().mockResolvedValue([]),
    findByEstado: jest.fn().mockResolvedValue([]),
    findById:     jest.fn().mockResolvedValue({ id: 1 }),
    create:       jest.fn().mockResolvedValue({ id: 1 }),
    update:       jest.fn().mockResolvedValue({ id: 1 }),
    cambiarEstado: jest.fn().mockResolvedValue({ id: 1, estado: EstadoMesa.OCUPADA }),
    delete:       jest.fn().mockResolvedValue({ id: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MesasController],
      providers: [{ provide: MesasService, useValue: mockMesasService }],
    }).compile();

    controller = module.get<MesasController>(MesasController);
    jest.clearAllMocks();
  });

  it('should be defined', () => expect(controller).toBeDefined());

  it('findAll sin estado deberia retornar todas las mesas', async () => {
    await controller.findAll();
    expect(mockMesasService.findAll).toHaveBeenCalled();
  });

  it('findAll con estado deberia filtrar por estado', async () => {
    await controller.findAll(EstadoMesa.LIBRE);
    expect(mockMesasService.findByEstado).toHaveBeenCalledWith(EstadoMesa.LIBRE);
  });

  it('findById deberia llamar al service con el id', async () => {
    await controller.findById('1');
    expect(mockMesasService.findById).toHaveBeenCalledWith(1);
  });

  it('create deberia llamar al service con el dto', async () => {
    const dto = { numero: 1, capacidad: 4, sectorId: 1 };
    await controller.create(dto as any);
    expect(mockMesasService.create).toHaveBeenCalledWith(dto);
  });

  it('update deberia llamar al service con id y dto', async () => {
    const dto = { capacidad: 6 };
    await controller.update('1', dto as any);
    expect(mockMesasService.update).toHaveBeenCalledWith(1, dto);
  });

  it('cambiarEstado deberia llamar al service con id y estado', async () => {
    await controller.cambiarEstado('1', EstadoMesa.OCUPADA);
    expect(mockMesasService.cambiarEstado).toHaveBeenCalledWith(1, EstadoMesa.OCUPADA);
  });

  it('delete deberia llamar al service con el id', async () => {
    await controller.delete('1');
    expect(mockMesasService.delete).toHaveBeenCalledWith(1);
  });
});