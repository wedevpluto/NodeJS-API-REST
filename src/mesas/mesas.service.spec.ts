import { Test, TestingModule } from '@nestjs/testing';
import { MesasService } from './mesas.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { EstadoMesa } from '@prisma/client';

describe('MesasService', () => {
  let service: MesasService;

  const mockPrisma = {
    mesa: {
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
        MesasService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MesasService>(MesasService);
    jest.clearAllMocks();
  });

  it('should be defined', () => expect(service).toBeDefined());

  // ─── findAll ─────────────────────────────────────────────
  describe('findAll', () => {
    it('deberia retornar todas las mesas', async () => {
      const mesas = [{ id: 1, numero: 1 }, { id: 2, numero: 2 }];
      mockPrisma.mesa.findMany.mockResolvedValue(mesas);
      const result = await service.findAll();
      expect(result).toEqual(mesas);
    });
  });

  // ─── findByEstado ────────────────────────────────────────
  describe('findByEstado', () => {
    it('deberia retornar mesas filtradas por estado', async () => {
      const mesas = [{ id: 1, estado: EstadoMesa.LIBRE }];
      mockPrisma.mesa.findMany.mockResolvedValue(mesas);
      const result = await service.findByEstado(EstadoMesa.LIBRE);
      expect(result).toEqual(mesas);
      expect(mockPrisma.mesa.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { estado: EstadoMesa.LIBRE },
        })
      );
    });
  });

  // ─── findById ────────────────────────────────────────────
  describe('findById', () => {
    it('deberia retornar una mesa existente', async () => {
      const mesa = { id: 1, numero: 1, estado: EstadoMesa.LIBRE };
      mockPrisma.mesa.findUnique.mockResolvedValue(mesa);
      const result = await service.findById(1);
      expect(result).toEqual(mesa);
    });

    it('deberia lanzar NotFoundException si no existe', async () => {
      mockPrisma.mesa.findUnique.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── create ──────────────────────────────────────────────
  describe('create', () => {
    it('deberia crear una mesa correctamente', async () => {
      const dto = { numero: 1, capacidad: 4, sectorId: 1 };
      const mesa = { id: 1, ...dto, estado: EstadoMesa.LIBRE };
      mockPrisma.mesa.create.mockResolvedValue(mesa);
      const result = await service.create(dto as any);
      expect(result).toHaveProperty('id', 1);
      expect(mockPrisma.mesa.create).toHaveBeenCalled();
    });
  });

  // ─── update ──────────────────────────────────────────────
  describe('update', () => {
    it('deberia actualizar una mesa existente', async () => {
      mockPrisma.mesa.findUnique.mockResolvedValue({ id: 1, capacidad: 4 });
      mockPrisma.mesa.update.mockResolvedValue({ id: 1, capacidad: 6 });
      const result = await service.update(1, { capacidad: 6 } as any);
      expect(result).toHaveProperty('capacidad', 6);
    });

    it('deberia lanzar NotFoundException si no existe', async () => {
      mockPrisma.mesa.findUnique.mockResolvedValue(null);
      await expect(service.update(999, {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── cambiarEstado ───────────────────────────────────────
  describe('cambiarEstado', () => {
    it('deberia cambiar el estado de una mesa', async () => {
      mockPrisma.mesa.findUnique.mockResolvedValue({ id: 1, estado: EstadoMesa.LIBRE });
      mockPrisma.mesa.update.mockResolvedValue({ id: 1, estado: EstadoMesa.OCUPADA });
      const result = await service.cambiarEstado(1, EstadoMesa.OCUPADA);
      expect(result).toHaveProperty('estado', EstadoMesa.OCUPADA);
    });

    it('deberia lanzar NotFoundException si no existe', async () => {
      mockPrisma.mesa.findUnique.mockResolvedValue(null);
      await expect(service.cambiarEstado(999, EstadoMesa.OCUPADA)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── delete ──────────────────────────────────────────────
  describe('delete', () => {
    it('deberia eliminar una mesa existente', async () => {
      mockPrisma.mesa.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.mesa.delete.mockResolvedValue({ id: 1 });
      await expect(service.delete(1)).resolves.not.toThrow();
    });

    it('deberia lanzar NotFoundException si no existe', async () => {
      mockPrisma.mesa.findUnique.mockResolvedValue(null);
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});