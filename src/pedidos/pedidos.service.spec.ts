import { Test, TestingModule } from '@nestjs/testing';
import { PedidosService } from './pedidos.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EstadoComanda, EstadoPedido } from '@prisma/client';
import { EventsGateway } from '../events/events.gateway';

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
    comanda: {
      findUnique: jest.fn(),
    },
    articulo: {
      findUnique: jest.fn(),
    },
  };

  const mockEventsGateway = {
    emitNuevoPedido: jest.fn(),
    emitEstadoPedido: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidosService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventsGateway, useValue: mockEventsGateway }, // 👈 ESTA LÍNEA ES LA CLAVE
      ],
    }).compile();

    service = module.get<PedidosService>(PedidosService);
  });

  it('should be defined', () => expect(service).toBeDefined());

  // ─── findByComanda ───────────────────────────────────────
  describe('findByComanda', () => {
    it('deberia retornar pedidos de una comanda', async () => {
      const pedidos = [{ id: 1, comandaId: 1 }];
      mockPrisma.pedido.findMany.mockResolvedValue(pedidos);
      const result = await service.findByComanda(1);
      expect(result).toEqual(pedidos);
      expect(mockPrisma.pedido.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { comandaId: 1 } })
      );
    });
  });

  // ─── findById ────────────────────────────────────────────
  describe('findById', () => {
    it('deberia retornar un pedido existente', async () => {
      const pedido = { id: 1, estado: EstadoPedido.PENDIENTE };
      mockPrisma.pedido.findUnique.mockResolvedValue(pedido);
      const result = await service.findById(1);
      expect(result).toEqual(pedido);
    });

    it('deberia lanzar NotFoundException si no existe', async () => {
      mockPrisma.pedido.findUnique.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── create ──────────────────────────────────────────────
  describe('create', () => {
    const dto = { comandaId: 1, articuloId: 1, cantidad: 2, nota: 'Sin sal' };

    it('deberia crear un pedido correctamente', async () => {
      mockPrisma.comanda.findUnique.mockResolvedValue({ id: 1, estado: EstadoComanda.ABIERTA });
      mockPrisma.articulo.findUnique.mockResolvedValue({ id: 1, nombre: 'Milanesa', precio: 1500, disponible: true });
      mockPrisma.pedido.create.mockResolvedValue({ id: 1, ...dto, precio: 1500 });

      const result = await service.create(dto);
      expect(result).toHaveProperty('id', 1);
      expect(mockPrisma.pedido.create).toHaveBeenCalled();
    });

    it('deberia lanzar NotFoundException si la comanda no existe', async () => {
      mockPrisma.comanda.findUnique.mockResolvedValue(null);
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('deberia lanzar BadRequestException si la comanda está cerrada', async () => {
      mockPrisma.comanda.findUnique.mockResolvedValue({ id: 1, estado: EstadoComanda.CERRADA });
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('deberia lanzar NotFoundException si el artículo no existe', async () => {
      mockPrisma.comanda.findUnique.mockResolvedValue({ id: 1, estado: EstadoComanda.ABIERTA });
      mockPrisma.articulo.findUnique.mockResolvedValue(null);
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('deberia lanzar BadRequestException si el artículo no está disponible', async () => {
      mockPrisma.comanda.findUnique.mockResolvedValue({ id: 1, estado: EstadoComanda.ABIERTA });
      mockPrisma.articulo.findUnique.mockResolvedValue({ id: 1, nombre: 'Milanesa', precio: 1500, disponible: false });
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  // ─── update ──────────────────────────────────────────────
  describe('update', () => {
    it('deberia modificar cantidad y nota de un pedido PENDIENTE', async () => {
      mockPrisma.pedido.findUnique.mockResolvedValue({
        id: 1,
        estado: EstadoPedido.PENDIENTE,
        comanda: { estado: EstadoComanda.ABIERTA },
      });
      mockPrisma.pedido.update.mockResolvedValue({ id: 1, cantidad: 3, nota: 'Sin cebolla' });

      const result = await service.update(1, { cantidad: 3, nota: 'Sin cebolla' });
      expect(result).toHaveProperty('cantidad', 3);
    });

    it('deberia lanzar BadRequestException si la comanda está cerrada', async () => {
      mockPrisma.pedido.findUnique.mockResolvedValue({
        id: 1,
        estado: EstadoPedido.PENDIENTE,
        comanda: { estado: EstadoComanda.CERRADA },
      });
      await expect(service.update(1, { cantidad: 2 })).rejects.toThrow(BadRequestException);
    });

    it('deberia lanzar BadRequestException si el pedido está ENTREGADO', async () => {
      mockPrisma.pedido.findUnique.mockResolvedValue({
        id: 1,
        estado: EstadoPedido.ENTREGADO,
        comanda: { estado: EstadoComanda.ABIERTA },
      });
      await expect(service.update(1, { cantidad: 2 })).rejects.toThrow(BadRequestException);
    });
  });

  // ─── cambiarEstado ───────────────────────────────────────
  describe('cambiarEstado', () => {
    it('deberia cambiar el estado de un pedido', async () => {
      mockPrisma.pedido.findUnique.mockResolvedValue({ id: 1, estado: EstadoPedido.PENDIENTE });
      mockPrisma.pedido.update.mockResolvedValue({ id: 1, estado: EstadoPedido.EN_PREPARACION });

      const result = await service.cambiarEstado(1, EstadoPedido.EN_PREPARACION);
      expect(result).toHaveProperty('estado', EstadoPedido.EN_PREPARACION);
    });

    it('deberia lanzar NotFoundException si el pedido no existe', async () => {
      mockPrisma.pedido.findUnique.mockResolvedValue(null);
      await expect(service.cambiarEstado(999, EstadoPedido.LISTO)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── delete ──────────────────────────────────────────────
  describe('delete', () => {
    it('deberia eliminar un pedido en estado PENDIENTE', async () => {
      mockPrisma.pedido.findUnique.mockResolvedValue({ id: 1, estado: EstadoPedido.PENDIENTE });
      mockPrisma.pedido.delete.mockResolvedValue({ id: 1 });
      await expect(service.delete(1)).resolves.not.toThrow();
    });

    it('deberia lanzar BadRequestException si el pedido no está PENDIENTE', async () => {
      mockPrisma.pedido.findUnique.mockResolvedValue({ id: 1, estado: EstadoPedido.ENTREGADO });
      await expect(service.delete(1)).rejects.toThrow(BadRequestException);
    });
  });
});