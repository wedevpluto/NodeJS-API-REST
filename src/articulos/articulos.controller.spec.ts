import { Test, TestingModule } from '@nestjs/testing';
import { ArticulosController } from './articulos.controller';
import { ArticulosService } from './articulos.service';
import { CategoriaArticulo } from '@prisma/client';

describe('ArticulosController', () => {
  let controller: ArticulosController;

  const mockArticulosService = {
    findAll:          jest.fn().mockResolvedValue([]),
    findById:         jest.fn().mockResolvedValue({ id: 1 }),
    create:           jest.fn().mockResolvedValue({ id: 1 }),
    update:           jest.fn().mockResolvedValue({ id: 1 }),
    toggleDisponible: jest.fn().mockResolvedValue({ id: 1, disponible: false }),
    delete:           jest.fn().mockResolvedValue({ id: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticulosController],
      providers: [{ provide: ArticulosService, useValue: mockArticulosService }],
    }).compile();

    controller = module.get<ArticulosController>(ArticulosController);
    jest.clearAllMocks();
  });

  it('should be defined', () => expect(controller).toBeDefined());

  it('findAll sin categoria deberia llamar al service', async () => {
    await controller.findAll();
    expect(mockArticulosService.findAll).toHaveBeenCalledWith(undefined);
  });

  it('findAll con categoria deberia filtrar correctamente', async () => {
    await controller.findAll(CategoriaArticulo.COMIDA);
    expect(mockArticulosService.findAll).toHaveBeenCalledWith(CategoriaArticulo.COMIDA);
  });

  it('findById deberia llamar al service con el id', async () => {
    await controller.findById('1');
    expect(mockArticulosService.findById).toHaveBeenCalledWith(1);
  });

  it('create deberia llamar al service con el dto', async () => {
    const dto = { nombre: 'Milanesa', precio: 1500, categoria: CategoriaArticulo.COMIDA };
    await controller.create(dto as any);
    expect(mockArticulosService.create).toHaveBeenCalledWith(dto);
  });

  it('update deberia llamar al service con id y dto', async () => {
    const dto = { precio: 2000 };
    await controller.update('1', dto as any);
    expect(mockArticulosService.update).toHaveBeenCalledWith(1, dto);
  });

  it('toggleDisponible deberia llamar al service con el id', async () => {
    await controller.toggleDisponible('1');
    expect(mockArticulosService.toggleDisponible).toHaveBeenCalledWith(1);
  });

  it('delete deberia llamar al service con el id', async () => {
    await controller.delete('1');
    expect(mockArticulosService.delete).toHaveBeenCalledWith(1);
  });
});