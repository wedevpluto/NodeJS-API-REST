import { Test, TestingModule } from '@nestjs/testing';
import { MesasService } from './mesas.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('MesasService', () => {
  let service: MesasService;

  const mockPrisma = {
    mesa: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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
  });

  it('should be defined', () => expect(service).toBeDefined());

  it('findById deberia lanzar NotFoundException si no existe', async () => {
    mockPrisma.mesa.findUnique.mockResolvedValue(null);
    await expect(service.findById(999)).rejects.toThrow(NotFoundException);
  });
});