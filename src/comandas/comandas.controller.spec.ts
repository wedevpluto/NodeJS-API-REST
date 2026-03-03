import { Test, TestingModule } from '@nestjs/testing';
import { ComandasController } from './comandas.controller';
import { ComandasService } from './comandas.service';
import { MetodoPago } from '@prisma/client';

describe('ComandasController', () => {
  let controller: ComandasController;

  const mockComandasService = {
    findAll:      jest.fn().mockResolvedValue([]),
    findById:     jest.fn().mockResolvedValue({ id: 1 }),
    findAbiertas: jest.fn().mockResolvedValue([]),
    create:       jest.fn().mockResolvedValue({ id: 1 }),
    cerrar:       jest.fn().mockResolvedValue({ id: 1, total: 3500, vuelto: 1500 }),
    cancelar:     jest.fn().mockResolvedValue({ id: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComandasController],
      providers: [{ provide: ComandasService, useValue: mockComandasService }],
    }).compile();

    controller = module.get<ComandasController>(ComandasController);
    jest.clearAllMocks();
  });

  it('should be defined', () => expect(controller).toBeDefined());

  it('findAll deberia llamar al service', async () => {
    await controller.findAll();
    expect(mockComandasService.findAll).toHaveBeenCalled();
  });

  it('findAbiertas deberia llamar al service', async () => {
    await controller.findAbiertas();
    expect(mockComandasService.findAbiertas).toHaveBeenCalled();
  });

  it('findById deberia llamar al service con el id', async () => {
    await controller.findById('1');
    expect(mockComandasService.findById).toHaveBeenCalledWith(1);
  });

  it('create deberia llamar al service con el dto', async () => {
    const dto = { mesaId: 1, mozoId: 1 };
    await controller.create(dto as any);
    expect(mockComandasService.create).toHaveBeenCalledWith(dto);
  });

  it('cerrar deberia llamar al service con id y cobroDto', async () => {
    const cobroDto = { metodoPago: MetodoPago.EFECTIVO, montoAbonado: 5000 };
    await controller.cerrar('1', cobroDto as any);
    expect(mockComandasService.cerrar).toHaveBeenCalledWith(1, cobroDto);
  });

  it('cancelar deberia llamar al service con el id', async () => {
    await controller.cancelar('1');
    expect(mockComandasService.cancelar).toHaveBeenCalledWith(1);
  });
});