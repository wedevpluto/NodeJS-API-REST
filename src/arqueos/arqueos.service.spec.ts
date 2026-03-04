import { Test, TestingModule } from '@nestjs/testing';
import { ArqueosService } from './application/arqueos.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateArqueoDto } from './dto/create-arqueo.dto';

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
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─────────────────────────────────────────────
  // findAll
  // ─────────────────────────────────────────────
  describe('findAll', () => {
    it('deberia retornar todos los arqueos', async () => {
      const arqueos = [{ id: 1 }, { id: 2 }];
      mockPrisma.arqueo.findMany.mockResolvedValue(arqueos);

      const result = await service.findAll();

      expect(result).toEqual(arqueos);
      expect(mockPrisma.arqueo.findMany).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────
  // findById
  // ─────────────────────────────────────────────
  describe('findById', () => {
    it('deberia retornar un arqueo existente', async () => {
      const arqueo = { id: 1, totalGeneral: 50000 };
      mockPrisma.arqueo.findUnique.mockResolvedValue(arqueo);

      const result = await service.findById(1);

      expect(result).toEqual(arqueo);
    });

    it('deberia lanzar NotFoundException si no existe', async () => {
      mockPrisma.arqueo.findUnique.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─────────────────────────────────────────────
  // findUltimo
  // ─────────────────────────────────────────────
  describe('findUltimo', () => {
    it('deberia retornar el ultimo arqueo', async () => {
      const arqueo = { id: 5, totalGeneral: 80000 };
      mockPrisma.arqueo.findFirst.mockResolvedValue(arqueo);

      const result = await service.findUltimo();

      expect(result).toEqual(arqueo);
      expect(mockPrisma.arqueo.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { fecha: 'desc' },
        }),
      );
    });

    it('deberia retornar null si no hay arqueos', async () => {
      mockPrisma.arqueo.findFirst.mockResolvedValue(null);

      const result = await service.findUltimo();

      expect(result).toBeNull();
    });
  });

  // ─────────────────────────────────────────────
  // create
  // ─────────────────────────────────────────────
  describe('create', () => {
    const dto: CreateArqueoDto = {
      cajeroId: 1,
      billetes1000: 5,
      billetes2000: 3,
      billetes5000: 2,
      billetes10000: 1,
      totalEfectivo: 21000,
      totalDebito: 8000,
      totalCredito: 5000,
      totalTransferencia: 3000,
      totalQr: 2000,
      totalPedidosYaCtaCte: 1500,
      totalPedidosYaEfectivo: 1000,
      totalRappiCtaCte: 800,
      totalRappiEfectivo: 500,
    };

    it('deberia calcular correctamente totalGeneral', async () => {
      const totalEsperado = 42800;

      mockPrisma.arqueo.create.mockResolvedValue({
        id: 1,
        totalGeneral: totalEsperado,
      });

      const result = await service.create(dto);

      expect(mockPrisma.arqueo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalGeneral: totalEsperado,
          }),
        }),
      );

      expect(result.totalGeneral).toBe(totalEsperado);
    });

    it('deberia calcular correctamente la diferencia', async () => {
      // efectivo contado:
      // 5x1000 + 3x2000 + 2x5000 + 1x10000
      // = 5000 + 6000 + 10000 + 10000 = 31000
      // diferencia = 31000 - 21000 = 10000

      mockPrisma.arqueo.create.mockResolvedValue({
        id: 1,
        diferencia: 10000,
      });

      await service.create(dto);

      expect(mockPrisma.arqueo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            diferencia: 10000,
          }),
        }),
      );
    });

    it('deberia usar 0 cuando un metodo no se provee', async () => {
      const dtoMinimo: CreateArqueoDto = {
        cajeroId: 1,
        totalEfectivo: 5000,
      };

      mockPrisma.arqueo.create.mockResolvedValue({
        id: 1,
        totalGeneral: 5000,
      });

      await service.create(dtoMinimo);

      expect(mockPrisma.arqueo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalDebito: 0,
            totalCredito: 0,
            totalGeneral: 5000,
          }),
        }),
      );
    });
  });
});