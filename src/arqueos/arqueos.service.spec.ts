import { Test, TestingModule } from '@nestjs/testing';
import { ArqueosService } from './arqueos.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ArqueosService', () => {
  let service: ArqueosService;

  const mockPrisma = {
    arqueo: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArqueosService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ArqueosService>(ArqueosService);
  });

  it('should be defined', () => expect(service).toBeDefined());

  it('findById deberia lanzar NotFoundException si no existe', async () => {
    mockPrisma.arqueo.findUnique.mockResolvedValue(null);
    await expect(service.findById(999)).rejects.toThrow(NotFoundException);
  });
});