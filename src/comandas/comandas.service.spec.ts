import { Test, TestingModule } from '@nestjs/testing';
import { ComandasService } from './comandas.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ComandasService', () => {
  let service: ComandasService;

  const mockPrisma = {
    comanda: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    mesa: { update: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComandasService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ComandasService>(ComandasService);
  });

  it('should be defined', () => expect(service).toBeDefined());

  it('findById deberia lanzar NotFoundException si no existe', async () => {
    mockPrisma.comanda.findUnique.mockResolvedValue(null);
    await expect(service.findById(999)).rejects.toThrow(NotFoundException);
  });
});