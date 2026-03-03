import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrisma = {
    user: {
      findMany:   jest.fn(),
      findUnique: jest.fn(),
      create:     jest.fn(),
      update:     jest.fn(),
      delete:     jest.fn(),
      count:      jest.fn().mockResolvedValue(0),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => expect(service).toBeDefined());

  // ─── findAll ─────────────────────────────────────────────
  describe('findAll', () => {
    it('deberia retornar usuarios paginados', async () => {
      const users = [{ id: 1, email: 'test@test.com', name: 'Juan', role: Role.MOZO }];
      mockPrisma.user.findMany.mockResolvedValue(users);
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta).toHaveProperty('total', 1);
      expect(result.meta).toHaveProperty('page', 1);
    });

    it('deberia calcular correctamente hasNextPage y hasPrevPage', async () => {
      mockPrisma.user.findMany.mockResolvedValue([{ id: 1 }]);
      mockPrisma.user.count.mockResolvedValue(15);

      const result = await service.findAll({ page: 2, limit: 10 });
      expect(result.meta).toHaveProperty('hasNextPage', false);
      expect(result.meta).toHaveProperty('hasPrevPage', true);
    });
  });

  // ─── findById ────────────────────────────────────────────
  describe('findById', () => {
    it('deberia retornar un usuario existente', async () => {
      const user = { id: 1, email: 'test@test.com', name: 'Juan' };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      const result = await service.findById(1);
      expect(result).toEqual(user);
    });

    it('deberia lanzar NotFoundException si no existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── create ──────────────────────────────────────────────
  describe('create', () => {
    const dto = { email: 'nuevo@test.com', password: 'pass123', name: 'Pedro', role: Role.CAJERO };

    it('deberia crear un usuario correctamente', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 1, ...dto });
      const result = await service.create(dto);
      expect(result).toHaveProperty('id', 1);
    });

    it('deberia lanzar ConflictException si el email ya existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: dto.email });
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  // ─── update ──────────────────────────────────────────────
  describe('update', () => {
    it('deberia actualizar un usuario existente', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, name: 'Juan' });
      mockPrisma.user.update.mockResolvedValue({ id: 1, name: 'Carlos' });
      const result = await service.update(1, { name: 'Carlos' });
      expect(result).toHaveProperty('name', 'Carlos');
    });

    it('deberia lanzar NotFoundException si no existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  // ─── delete ──────────────────────────────────────────────
  describe('delete', () => {
    it('deberia eliminar un usuario existente', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.user.delete.mockResolvedValue({ id: 1 });
      await expect(service.delete(1)).resolves.not.toThrow();
    });

    it('deberia lanzar NotFoundException si no existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});