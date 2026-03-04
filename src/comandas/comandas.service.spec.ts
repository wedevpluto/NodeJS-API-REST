import { Test, TestingModule } from '@nestjs/testing';
import { ComandasService } from './comandas.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EstadoComanda, EstadoMesa, EstadoPedido, MetodoPago } from '@prisma/client';
import { EventsGateway } from '../events/events.gateway';

describe('ComandasService', () => {
  let service: ComandasService;

  const mockPrisma = {
    comanda: {
      findMany:   jest.fn(),
      findUnique: jest.fn(),
      create:     jest.fn(),
      update:     jest.fn(),
    },
    mesa:         { findUnique: jest.fn(), update: jest.fn() },
    cobro:        { create: jest.fn() },
    $transaction: jest.fn(),
  };

  const mockEventsGateway = {
    emitComandaCerrada:   jest.fn(),
    emitComandaCancelada: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComandasService,
        { provide: PrismaService, useValue: mockPrisma        },
        { provide: EventsGateway, useValue: mockEventsGateway },
      ],
    }).compile();

    service = module.get<ComandasService>(ComandasService);
    jest.clearAllMocks();
  });

  it('should be defined', () => expect(service).toBeDefined());

  // ─── findById ────────────────────────────────────────────
  describe('findById', () => {
    it('deberia retornar una comanda existente', async () => {
      const comanda = { id: 1, estado: EstadoComanda.ABIERTA, pedidos: [] };
      mockPrisma.comanda.findUnique.mockResolvedValue(comanda);
      const result = await service.findById(1);
      expect(result).toEqual(comanda);
    });

    it('deberia lanzar NotFoundException si no existe', async () => {
      mockPrisma.comanda.findUnique.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── findAll ─────────────────────────────────────────────
  describe('findAll', () => {
    it('deberia retornar todas las comandas', async () => {
      const comandas = [{ id: 1 }, { id: 2 }];
      mockPrisma.comanda.findMany.mockResolvedValue(comandas);
      const result = await service.findAll();
      expect(result).toEqual(comandas);
    });
  });

  // ─── findAbiertas ────────────────────────────────────────
  describe('findAbiertas', () => {
    it('deberia retornar solo comandas abiertas', async () => {
      const abiertas = [{ id: 1, estado: EstadoComanda.ABIERTA }];
      mockPrisma.comanda.findMany.mockResolvedValue(abiertas);
      const result = await service.findAbiertas();
      expect(result).toEqual(abiertas);
      expect(mockPrisma.comanda.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { estado: EstadoComanda.ABIERTA } })
      );
    });
  });

  // ─── create ──────────────────────────────────────────────
  describe('create', () => {
    const dto = { mesaId: 1, mozoId: 1 };

    it('deberia crear una comanda y ocupar la mesa', async () => {
      mockPrisma.mesa.findUnique.mockResolvedValue({ id: 1, estado: EstadoMesa.LIBRE, numero: 1 });
      mockPrisma.$transaction.mockResolvedValue([{ id: 1, ...dto }]);
      const result = await service.create(dto);
      expect(result).toHaveProperty('id', 1);
    });

    it('deberia lanzar NotFoundException si la mesa no existe', async () => {
      mockPrisma.mesa.findUnique.mockResolvedValue(null);
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('deberia lanzar BadRequestException si la mesa está ocupada', async () => {
      mockPrisma.mesa.findUnique.mockResolvedValue({ id: 1, estado: EstadoMesa.OCUPADA, numero: 1 });
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  // ─── marcarListaParaCobrar ───────────────────────────────
  describe('marcarListaParaCobrar', () => {
    it('deberia marcar la comanda como LISTA_PARA_COBRAR', async () => {
      mockPrisma.comanda.findUnique.mockResolvedValue({
        id: 1,
        estado: EstadoComanda.ABIERTA,
        pedidos: [{ estado: EstadoPedido.ENTREGADO }],
      });
      mockPrisma.comanda.update.mockResolvedValue({ id: 1, estado: EstadoComanda.LISTA_PARA_COBRAR });
      const result = await service.marcarListaParaCobrar(1);
      expect(result).toHaveProperty('estado', EstadoComanda.LISTA_PARA_COBRAR);
    });

    it('deberia lanzar BadRequestException si la comanda no está ABIERTA', async () => {
      mockPrisma.comanda.findUnique.mockResolvedValue({
        id: 1, estado: EstadoComanda.CERRADA, pedidos: [],
      });
      await expect(service.marcarListaParaCobrar(1)).rejects.toThrow(BadRequestException);
    });

    it('deberia lanzar BadRequestException si no hay pedidos', async () => {
      mockPrisma.comanda.findUnique.mockResolvedValue({
        id: 1, estado: EstadoComanda.ABIERTA, pedidos: [],
      });
      await expect(service.marcarListaParaCobrar(1)).rejects.toThrow(BadRequestException);
    });

    it('deberia lanzar BadRequestException si hay pedidos pendientes', async () => {
      mockPrisma.comanda.findUnique.mockResolvedValue({
        id: 1,
        estado: EstadoComanda.ABIERTA,
        pedidos: [{ estado: EstadoPedido.PENDIENTE }],
      });
      await expect(service.marcarListaParaCobrar(1)).rejects.toThrow(BadRequestException);
    });
  });

  // ─── cerrar ──────────────────────────────────────────────
  describe('cerrar', () => {
    const cobroDto = { metodoPago: MetodoPago.EFECTIVO, montoAbonado: 5000 };

    it('deberia cerrar la comanda y calcular vuelto', async () => {
      mockPrisma.comanda.findUnique.mockResolvedValue({
        id: 1,
        estado: EstadoComanda.LISTA_PARA_COBRAR,
        mesaId: 1,
        pedidos: [
          { precio: 1500, cantidad: 2 },
          { precio: 500,  cantidad: 1 },
        ],
      });
      mockPrisma.$transaction.mockResolvedValue([{ id: 1, estado: EstadoComanda.CERRADA, total: 3500 }]);

      const result = await service.cerrar(1, cobroDto);
      expect(result).toHaveProperty('total', 3500);
      expect(result).toHaveProperty('vuelto', 1500);
    });

    it('deberia lanzar BadRequestException si la comanda no está LISTA_PARA_COBRAR', async () => {
      mockPrisma.comanda.findUnique.mockResolvedValue({
        id: 1, estado: EstadoComanda.ABIERTA, pedidos: [],
      });
      await expect(service.cerrar(1, cobroDto)).rejects.toThrow(BadRequestException);
    });

    it('deberia lanzar BadRequestException si el monto abonado es insuficiente', async () => {
      mockPrisma.comanda.findUnique.mockResolvedValue({
        id: 1,
        estado: EstadoComanda.LISTA_PARA_COBRAR,
        mesaId: 1,
        pedidos: [{ precio: 3000, cantidad: 2 }], // total 6000
      });
      const cobroDtoInsuficiente = { metodoPago: MetodoPago.EFECTIVO, montoAbonado: 1000 };
      await expect(service.cerrar(1, cobroDtoInsuficiente)).rejects.toThrow(BadRequestException);
    });

    it('deberia lanzar NotFoundException si la comanda no existe', async () => {
      mockPrisma.comanda.findUnique.mockResolvedValue(null);
      await expect(service.cerrar(999, cobroDto)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── cancelar ────────────────────────────────────────────
  describe('cancelar', () => {
    it('deberia cancelar una comanda abierta sin pedidos entregados', async () => {
      mockPrisma.comanda.findUnique.mockResolvedValue({
        id: 1, estado: EstadoComanda.ABIERTA, mesaId: 1,
        pedidos: [{ estado: EstadoPedido.PENDIENTE }],
      });
      mockPrisma.$transaction.mockResolvedValue([{ id: 1, estado: EstadoComanda.CANCELADA }]);
      const result = await service.cancelar(1);
      expect(result).toHaveProperty('estado', EstadoComanda.CANCELADA);
    });

    it('deberia lanzar BadRequestException si la comanda no está ABIERTA', async () => {
      mockPrisma.comanda.findUnique.mockResolvedValue({
        id: 1, estado: EstadoComanda.CERRADA, pedidos: [],
      });
      await expect(service.cancelar(1)).rejects.toThrow(BadRequestException);
    });

    it('deberia lanzar BadRequestException si hay pedidos entregados', async () => {
      mockPrisma.comanda.findUnique.mockResolvedValue({
        id: 1, estado: EstadoComanda.ABIERTA, mesaId: 1,
        pedidos: [{ estado: EstadoPedido.ENTREGADO }],
      });
      await expect(service.cancelar(1)).rejects.toThrow(BadRequestException);
    });
  });
});