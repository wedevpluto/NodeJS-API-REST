import { Test, TestingModule } from '@nestjs/testing';
import { ArqueosController } from './arqueos.controller';
import { ArqueosService } from './arqueos.service';

describe('ArqueosController', () => {
  let controller: ArqueosController;

  const mockArqueosService = {
    findAll:    jest.fn().mockResolvedValue([]),
    findUltimo: jest.fn().mockResolvedValue({ id: 1 }),
    findById:   jest.fn().mockResolvedValue({ id: 1 }),
    create:     jest.fn().mockResolvedValue({ id: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArqueosController],
      providers: [{ provide: ArqueosService, useValue: mockArqueosService }],
    }).compile();

    controller = module.get<ArqueosController>(ArqueosController);
    jest.clearAllMocks();
  });

  it('should be defined', () => expect(controller).toBeDefined());

  it('findAll deberia llamar al service', async () => {
    await controller.findAll();
    expect(mockArqueosService.findAll).toHaveBeenCalled();
  });

  it('findUltimo deberia llamar al service', async () => {
    await controller.findUltimo();
    expect(mockArqueosService.findUltimo).toHaveBeenCalled();
  });

  it('findById deberia llamar al service con el id', async () => {
    await controller.findById('1');
    expect(mockArqueosService.findById).toHaveBeenCalledWith(1);
  });

  it('create deberia llamar al service con el dto', async () => {
    const dto = { cajeroId: 1, totalEfectivo: 5000 };
    await controller.create(dto as any);
    expect(mockArqueosService.create).toHaveBeenCalledWith(dto);
  });
});