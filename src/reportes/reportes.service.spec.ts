import { Test, TestingModule } from '@nestjs/testing';
import { ReportesService } from './reportes.service';
import { PrismaService } from '../database/prisma.service';

describe('ReportesService', () => {
  let service: ReportesService;

  const mockPrisma = {
    comanda: { findMany: jest.fn() },
    cobro:   { findMany: jest.fn() },
    pedido:  { findMany: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReportesService>(ReportesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => expect(service).toBeDefined());

  // ─── ventasDiarias ───────────────────────────────────────
  describe('ventasDiarias', () => {
    it('deberia retornar resumen del dia', async () => {
      const comandas = [
        { id: 1, total: 3500, cobro: {}, pedidos: [], mozo: { id: 1, name: 'Juan' } },
        { id: 2, total: 2000, cobro: {}, pedidos: [], mozo: { id: 1, name: 'Juan' } },
      ];
      mockPrisma.comanda.findMany.mockResolvedValue(comandas);

      const result = await service.ventasDiarias('2026-03-04');
      expect(result).toHaveProperty('totalComandas', 2);
      expect(result).toHaveProperty('totalGeneral', 5500);
      expect(result).toHaveProperty('fecha', '2026-03-04');
    });

    it('deberia retornar totalGeneral 0 si no hay comandas', async () => {
      mockPrisma.comanda.findMany.mockResolvedValue([]);
      const result = await service.ventasDiarias('2026-03-04');
      expect(result.totalGeneral).toBe(0);
      expect(result.totalComandas).toBe(0);
    });
  });

  // ─── ventasPorMozo ───────────────────────────────────────
  describe('ventasPorMozo', () => {
    it('deberia agrupar ventas por mozo y ordenar por total', async () => {
      mockPrisma.comanda.findMany.mockResolvedValue([
        { id: 1, total: 3000, mozo: { id: 1, name: 'Juan' } },
        { id: 2, total: 1500, mozo: { id: 2, name: 'Pedro' } },
        { id: 3, total: 2000, mozo: { id: 1, name: 'Juan' } },
      ]);

      const result = await service.ventasPorMozo('2026-03-01', '2026-03-04');
      expect(result.mozos[0]).toHaveProperty('name', 'Juan');
      expect(result.mozos[0]).toHaveProperty('totalVentas', 5000);
      expect(result.mozos[0]).toHaveProperty('totalComandas', 2);
    });

    it('deberia retornar lista vacia si no hay comandas', async () => {
      mockPrisma.comanda.findMany.mockResolvedValue([]);
      const result = await service.ventasPorMozo('2026-03-01', '2026-03-04');
      expect(result.mozos).toHaveLength(0);
    });
  });

  // ─── ventasPorMetodoPago ─────────────────────────────────
  describe('ventasPorMetodoPago', () => {
    it('deberia agrupar cobros por metodo de pago', async () => {
      mockPrisma.cobro.findMany.mockResolvedValue([
        { metodoPago: 'EFECTIVO',    montoAbonado: 3000 },
        { metodoPago: 'EFECTIVO',    montoAbonado: 1500 },
        { metodoPago: 'DEBITO',      montoAbonado: 2000 },
      ]);

      const result = await service.ventasPorMetodoPago('2026-03-01', '2026-03-04');
      expect(result.totalGeneral).toBe(6500);
      expect(result.metodos[0]).toHaveProperty('metodo', 'EFECTIVO');
      expect(result.metodos[0]).toHaveProperty('totalMonto', 4500);
      expect(result.metodos[0]).toHaveProperty('totalTransacciones', 2);
    });
  });

  // ─── articulosMasVendidos ────────────────────────────────
  describe('articulosMasVendidos', () => {
    it('deberia retornar ranking ordenado por cantidad vendida', async () => {
      mockPrisma.pedido.findMany.mockResolvedValue([
        { cantidad: 5, precio: 1500, articulo: { id: 1, nombre: 'Milanesa',  categoria: 'COMIDA' } },
        { cantidad: 3, precio: 500,  articulo: { id: 2, nombre: 'Coca Cola', categoria: 'BEBIDA' } },
        { cantidad: 2, precio: 1500, articulo: { id: 1, nombre: 'Milanesa',  categoria: 'COMIDA' } },
      ]);

      const result = await service.articulosMasVendidos('2026-03-01', '2026-03-04');
      expect(result.ranking[0]).toHaveProperty('nombre', 'Milanesa');
      expect(result.ranking[0]).toHaveProperty('cantidadVendida', 7);
      expect(result.ranking[0]).toHaveProperty('totalRecaudado', 10500);
    });

    it('deberia respetar el limite de resultados', async () => {
      const pedidos = Array.from({ length: 15 }, (_, i) => ({
        cantidad: 1,
        precio: 100,
        articulo: { id: i + 1, nombre: `Articulo ${i + 1}`, categoria: 'COMIDA' },
      }));
      mockPrisma.pedido.findMany.mockResolvedValue(pedidos);

      const result = await service.articulosMasVendidos('2026-03-01', '2026-03-04', 5);
      expect(result.ranking).toHaveLength(5);
    });
  });
});