import { Test, TestingModule } from '@nestjs/testing';
import { ArticulosService } from './articulos.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CategoriaArticulo } from '@prisma/client';

describe('ArticulosService', () => {
  let service: ArticulosService;

  const mockPrisma = {
    articulo: {
      findMany:   jest.fn(),
      findUnique: jest.fn(),
      create:     jest.fn(),
      update:     jest.fn(),
      delete:     jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticulosService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ArticulosService>(ArticulosService);
    jest.clearAllMocks();
  });

  it('should be defined', () => expect(service).toBeDefined());

  // ─── findAll ─────────────────────────────────────────────
  describe('findAll', () => {
    it('deberia retornar todos los articulos', async () => {
      const articulos = [{ id: 1, nombre: 'Milanesa' }, { id: 2, nombre: 'Coca Cola' }];
      mockPrisma.articulo.findMany.mockResolvedValue(articulos);
      const result = await service.findAll();
      expect(result).toEqual(articulos);
    });

    it('deberia filtrar por categoria si se provee', async () => {
      const articulos = [{ id: 1, nombre: 'Milanesa', categoria: CategoriaArticulo.COMIDA }];
      mockPrisma.articulo.findMany.mockResolvedValue(articulos);
      const result = await service.findAll(CategoriaArticulo.COMIDA);
      expect(result).toEqual(articulos);
      expect(mockPrisma.articulo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { categoria: CategoriaArticulo.COMIDA },
        })
      );
    });
  });

  // ─── findById ────────────────────────────────────────────
  describe('findById', () => {
    it('deberia retornar un articulo existente', async () => {
      const articulo = { id: 1, nombre: 'Milanesa', precio: 1500 };
      mockPrisma.articulo.findUnique.mockResolvedValue(articulo);
      const result = await service.findById(1);
      expect(result).toEqual(articulo);
    });

    it('deberia lanzar NotFoundException si no existe', async () => {
      mockPrisma.articulo.findUnique.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── create ──────────────────────────────────────────────
  describe('create', () => {
    it('deberia crear un articulo correctamente', async () => {
      const dto = { nombre: 'Milanesa', precio: 1500, categoria: CategoriaArticulo.COMIDA };
      const articulo = { id: 1, ...dto, disponible: true };
      mockPrisma.articulo.create.mockResolvedValue(articulo);
      const result = await service.create(dto);
      expect(result).toHaveProperty('id', 1);
      expect(mockPrisma.articulo.create).toHaveBeenCalled();
    });
  });

  // ─── update ──────────────────────────────────────────────
  describe('update', () => {
    it('deberia actualizar un articulo existente', async () => {
      const articulo = { id: 1, nombre: 'Milanesa', precio: 1500 };
      mockPrisma.articulo.findUnique.mockResolvedValue(articulo);
      mockPrisma.articulo.update.mockResolvedValue({ ...articulo, precio: 2000 });
      const result = await service.update(1, { precio: 2000 } as any);
      expect(result).toHaveProperty('precio', 2000);
    });

    it('deberia lanzar NotFoundException si no existe', async () => {
      mockPrisma.articulo.findUnique.mockResolvedValue(null);
      await expect(service.update(999, {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── toggleDisponible ────────────────────────────────────
  describe('toggleDisponible', () => {
    it('deberia cambiar disponible de true a false', async () => {
      mockPrisma.articulo.findUnique.mockResolvedValue({ id: 1, disponible: true });
      mockPrisma.articulo.update.mockResolvedValue({ id: 1, disponible: false });
      const result = await service.toggleDisponible(1);
      expect(result).toHaveProperty('disponible', false);
    });

    it('deberia cambiar disponible de false a true', async () => {
      mockPrisma.articulo.findUnique.mockResolvedValue({ id: 1, disponible: false });
      mockPrisma.articulo.update.mockResolvedValue({ id: 1, disponible: true });
      const result = await service.toggleDisponible(1);
      expect(result).toHaveProperty('disponible', true);
    });

    it('deberia lanzar NotFoundException si no existe', async () => {
      mockPrisma.articulo.findUnique.mockResolvedValue(null);
      await expect(service.toggleDisponible(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── delete ──────────────────────────────────────────────
  describe('delete', () => {
    it('deberia eliminar un articulo existente', async () => {
      mockPrisma.articulo.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.articulo.delete.mockResolvedValue({ id: 1 });
      await expect(service.delete(1)).resolves.not.toThrow();
    });

    it('deberia lanzar NotFoundException si no existe', async () => {
      mockPrisma.articulo.findUnique.mockResolvedValue(null);
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});