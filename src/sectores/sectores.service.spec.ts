import { Test, TestingModule } from '@nestjs/testing';
import { SectoresService } from './sectores.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('SectoresService', () => {
  let service: SectoresService;

  const mockPrisma = {
    sector: {
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
        SectoresService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SectoresService>(SectoresService);
    jest.clearAllMocks();
  });

  it('should be defined', () => expect(service).toBeDefined());

  // ─── findAll ─────────────────────────────────────────────
  describe('findAll', () => {
    it('deberia retornar todos los sectores', async () => {
      const sectores = [{ id: 1, nombre: 'Salón' }, { id: 2, nombre: 'Terraza' }];
      mockPrisma.sector.findMany.mockResolvedValue(sectores);
      const result = await service.findAll();
      expect(result).toEqual(sectores);
    });
  });

  // ─── findById ────────────────────────────────────────────
  describe('findById', () => {
    it('deberia retornar un sector existente', async () => {
      const sector = { id: 1, nombre: 'Salón', mesas: [] };
      mockPrisma.sector.findUnique.mockResolvedValue(sector);
      const result = await service.findById(1);
      expect(result).toEqual(sector);
    });

    it('deberia lanzar NotFoundException si no existe', async () => {
      mockPrisma.sector.findUnique.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── create ──────────────────────────────────────────────
  describe('create', () => {
    it('deberia crear un sector correctamente', async () => {
      const dto = { nombre: 'Salón principal' };
      const sector = { id: 1, ...dto };
      mockPrisma.sector.create.mockResolvedValue(sector);
      const result = await service.create(dto);
      expect(result).toHaveProperty('id', 1);
      expect(mockPrisma.sector.create).toHaveBeenCalled();
    });
  });

  // ─── update ──────────────────────────────────────────────
  describe('update', () => {
    it('deberia actualizar un sector existente', async () => {
      mockPrisma.sector.findUnique.mockResolvedValue({ id: 1, nombre: 'Salón' });
      mockPrisma.sector.update.mockResolvedValue({ id: 1, nombre: 'Salón VIP' });
      const result = await service.update(1, { nombre: 'Salón VIP' });
      expect(result).toHaveProperty('nombre', 'Salón VIP');
    });

    it('deberia lanzar NotFoundException si no existe', async () => {
      mockPrisma.sector.findUnique.mockResolvedValue(null);
      await expect(service.update(999, { nombre: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  // ─── delete ──────────────────────────────────────────────
  describe('delete', () => {
    it('deberia eliminar un sector existente', async () => {
      mockPrisma.sector.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.sector.delete.mockResolvedValue({ id: 1 });
      await expect(service.delete(1)).resolves.not.toThrow();
    });

    it('deberia lanzar NotFoundException si no existe', async () => {
      mockPrisma.sector.findUnique.mockResolvedValue(null);
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});