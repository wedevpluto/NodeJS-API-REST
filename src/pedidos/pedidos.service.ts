import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { EstadoComanda, EstadoPedido } from '@prisma/client';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class PedidosService {
  constructor(
    private prisma: PrismaService,
    private events: EventsGateway,
  ) {}

  // ─────────────────────────────────────────────
  // Máquina de estados robusta
  // ─────────────────────────────────────────────
  private readonly transicionesValidas: Record<EstadoPedido, EstadoPedido[]> = {
    [EstadoPedido.PENDIENTE]: [
      EstadoPedido.EN_PREPARACION,
      EstadoPedido.CANCELADO,
    ],

    [EstadoPedido.EN_PREPARACION]: [
      EstadoPedido.LISTO,
      EstadoPedido.CANCELADO,
    ],

    [EstadoPedido.LISTO]: [
      EstadoPedido.ENTREGADO,
    ],

    [EstadoPedido.ENTREGADO]: [],

    [EstadoPedido.CANCELADO]: [],
  };

  // ─────────────────────────────────────────────

  async findByComanda(comandaId: number) {
    return this.prisma.pedido.findMany({
      where: { comandaId },
      include: { articulo: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: number) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: { articulo: true, comanda: true },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido ${id} no encontrado`);
    }

    return pedido;
  }

  // ─────────────────────────────────────────────

  async create(dto: CreatePedidoDto) {
    const comanda = await this.prisma.comanda.findUnique({
      where: { id: dto.comandaId },
    });

    if (!comanda) {
      throw new NotFoundException(`Comanda ${dto.comandaId} no encontrada`);
    }

    if (comanda.estado !== EstadoComanda.ABIERTA) {
      throw new BadRequestException(
        'No se pueden agregar pedidos a una comanda que no esté ABIERTA',
      );
    }

    const articulo = await this.prisma.articulo.findUnique({
      where: { id: dto.articuloId },
    });

    if (!articulo) {
      throw new NotFoundException(`Artículo ${dto.articuloId} no encontrado`);
    }

    if (!articulo.disponible) {
      throw new BadRequestException(
        `El artículo "${articulo.nombre}" no está disponible`,
      );
    }

    const pedido = await this.prisma.pedido.create({
      data: {
        comandaId: dto.comandaId,
        articuloId: dto.articuloId,
        cantidad: dto.cantidad,
        precio: articulo.precio,
        nota: dto.nota,
        estado: EstadoPedido.PENDIENTE,
      },
      include: { articulo: true },
    });

    this.events.emitNuevoPedido(pedido);

    return pedido;
  }

  // ─────────────────────────────────────────────

  async update(id: number, dto: UpdatePedidoDto) {
    const pedido = await this.findById(id);

    if (pedido.comanda.estado !== EstadoComanda.ABIERTA) {
      throw new BadRequestException(
        'No se puede modificar un pedido de una comanda no ABIERTA',
      );
    }

    if (
      ![EstadoPedido.PENDIENTE, EstadoPedido.EN_PREPARACION].includes(
        pedido.estado,
      )
    ) {
      throw new BadRequestException(
        `No se puede modificar un pedido en estado ${pedido.estado}`,
      );
    }

    return this.prisma.pedido.update({
      where: { id },
      data: {
        ...(dto.cantidad !== undefined && { cantidad: dto.cantidad }),
        ...(dto.nota !== undefined && { nota: dto.nota }),
      },
      include: { articulo: true },
    });
  }

  // ─────────────────────────────────────────────

  async cambiarEstado(id: number, nuevoEstado: EstadoPedido) {
    const pedido = await this.findById(id);

    const estadosPermitidos = this.transicionesValidas[pedido.estado];

    if (!estadosPermitidos.includes(nuevoEstado)) {
      throw new BadRequestException(
        `Transición inválida: ${pedido.estado} → ${nuevoEstado}`,
      );
    }

    const actualizado = await this.prisma.pedido.update({
      where: { id },
      data: { estado: nuevoEstado },
      include: { articulo: true },
    });

    this.events.emitEstadoPedido(actualizado);

    return actualizado;
  }

  // ─────────────────────────────────────────────

  async delete(id: number) {
    const pedido = await this.findById(id);

    if (pedido.estado !== EstadoPedido.PENDIENTE) {
      throw new BadRequestException(
        'Solo se pueden eliminar pedidos en estado PENDIENTE',
      );
    }

    return this.prisma.pedido.delete({ where: { id } });
  }
}