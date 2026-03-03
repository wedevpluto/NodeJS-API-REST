import { Test, TestingModule } from '@nestjs/testing';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { EstadoPedido } from '@prisma/client';

describe('PedidosController', () => {
  let controller: PedidosController;

  const mockPedidosService = {
    findByComanda: jest.fn().mockResolvedValue([]),
    findById:      jest.fn().mockResolvedValue({ id: 1 }),
    create:        jest.fn().mockResolvedValue({ id: 1 }),
    update:        jest.fn().mockResolvedValue({ id: 1 }),
    cambiarEstado: jest.fn().mockResolvedValue({ id: 1 }),
    delete:        jest.fn().mockResolvedValue({ id: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PedidosController],
      providers: [{ provide: PedidosService, useValue: mockPedidosService }],
    }).compile();

    controller = module.get<PedidosController>(PedidosController);
    jest.clearAllMocks();
  });

  it('should be defined', () => expect(controller).toBeDefined());

  it('findByComanda deberia llamar al service con el comandaId', async () => {
    await controller.findByComanda('1');
    expect(mockPedidosService.findByComanda).toHaveBeenCalledWith(1);
  });

  it('findById deberia llamar al service con el id', async () => {
    await controller.findById('1');
    expect(mockPedidosService.findById).toHaveBeenCalledWith(1);
  });

  it('create deberia llamar al service con el dto', async () => {
    const dto = { comandaId: 1, articuloId: 1, cantidad: 2 };
    await controller.create(dto as any);
    expect(mockPedidosService.create).toHaveBeenCalledWith(dto);
  });

  it('update deberia llamar al service con id y dto', async () => {
    const dto = { cantidad: 3, nota: 'Sin sal' };
    await controller.update('1', dto);
    expect(mockPedidosService.update).toHaveBeenCalledWith(1, dto);
  });

  it('cambiarEstado deberia llamar al service con id y estado', async () => {
    await controller.cambiarEstado('1', EstadoPedido.EN_PREPARACION);
    expect(mockPedidosService.cambiarEstado).toHaveBeenCalledWith(1, EstadoPedido.EN_PREPARACION);
  });

  it('delete deberia llamar al service con el id', async () => {
    await controller.delete('1');
    expect(mockPedidosService.delete).toHaveBeenCalledWith(1);
  });
});