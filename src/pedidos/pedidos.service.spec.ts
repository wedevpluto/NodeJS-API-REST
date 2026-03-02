import { Test, TestingModule } from '@nestjs/testing';
import { PedidosService } from './pedidos.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('PedidosService', () => {
  let service: PedidosService;

  const mockPrisma = {
    pedido: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    comanda: { findUnique: jest.fn() },
    articulo: { findUnique: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidosService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PedidosService>(PedidosService);
  });

  it('should be defined', () => expect(service).toBeDefined());

  it('findById deberia lanzar NotFoundException si no existe', async () => {
    mockPrisma.pedido.findUnique.mockResolvedValue(null);
    await expect(service.findById(999)).rejects.toThrow(NotFoundException);
  });
});