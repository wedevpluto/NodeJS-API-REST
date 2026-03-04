import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { CobroDto } from './dto/cobro.dto';
import { EstadoComanda, EstadoMesa, EstadoPedido } from '@prisma/client';
import { EventsGateway } from '../events/events.gateway';
import { TicketService } from './ticket.service';

@Injectable()
export class ComandasService {
  constructor(
    private prisma: PrismaService,
    private events: EventsGateway,
    private ticketService: TicketService,
  ) {}

  // ─────────────────────────────────────────────
  // CONSULTAS
  // ─────────────────────────────────────────────

  async findAll() {
    return this.prisma.comanda.findMany({
      include: {
        mesa: { include: { sector: true } },
        mozo: { select: { id: true, name: true, email: true } },
        pedidos: { include: { articulo: true } },
        cobro: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number) {
    const comanda = await this.prisma.comanda.findUnique({
      where: { id },
      include: {
        mesa: { include: { sector: true } },
        mozo: { select: { id: true, name: true, email: true } },
        pedidos: { include: { articulo: true } },
        cobro: true,
      },
    });
    if (!comanda) throw new NotFoundException(`Comanda ${id} no encontrada`);
    return comanda;
  }

  async findAbiertas() {
    return this.prisma.comanda.findMany({
      where: { estado: EstadoComanda.ABIERTA },
      include: { mesa: true, mozo: true, pedidos: true },
    });
  }

  async findListasParaCobrar() {
    return this.prisma.comanda.findMany({
      where: { estado: EstadoComanda.LISTA_PARA_COBRAR },
      include: { mesa: true, mozo: true, pedidos: true },
    });
  }

  // ─────────────────────────────────────────────
  // CREAR COMANDA (MOZO)
  // ─────────────────────────────────────────────

  async create(dto: CreateComandaDto) {
    const mesa = await this.prisma.mesa.findUnique({ where: { id: dto.mesaId } });
    if (!mesa) throw new NotFoundException(`Mesa ${dto.mesaId} no encontrada`);
    if (mesa.estado === EstadoMesa.OCUPADA)
      throw new BadRequestException(`La mesa ${mesa.numero} ya está ocupada`);

    if (dto.pedidos && dto.pedidos.length > 0) {
      for (const p of dto.pedidos) {
        const articulo = await this.prisma.articulo.findUnique({ where: { id: p.articuloId } });
        if (!articulo) throw new NotFoundException(`Artículo ${p.articuloId} no encontrado`);
        if (!articulo.disponible)
          throw new BadRequestException(`El artículo "${articulo.nombre}" no está disponible`);
      }
    }

    const comanda = await this.prisma.comanda.create({
      data: {
        mesaId:     dto.mesaId,
        mozoId:     dto.mozoId,
        comensales: dto.comensales ?? 1,
        estado:     EstadoComanda.ABIERTA,
        pedidos: dto.pedidos && dto.pedidos.length > 0 ? {
          create: await Promise.all(dto.pedidos.map(async (p) => {
            const articulo = await this.prisma.articulo.findUnique({ where: { id: p.articuloId } });
            return {
              articuloId: p.articuloId,
              cantidad:   p.cantidad,
              precio:     articulo!.precio,
              nota:       p.nota,
              estado:     EstadoPedido.PENDIENTE,
            };
          })),
        } : undefined,
      },
      include: {
        mesa:    { include: { sector: true } },
        mozo:    { select: { id: true, name: true } },
        pedidos: { include: { articulo: true } },
      },
    });

    await this.prisma.mesa.update({
      where: { id: dto.mesaId },
      data:  { estado: EstadoMesa.OCUPADA },
    });

    if (comanda.pedidos.length > 0) {
      comanda.pedidos.forEach(p => this.events.emitNuevoPedido(p));
    }

    return comanda;
  }

  // ─────────────────────────────────────────────
  // MOZO PIDE CUENTA
  // ─────────────────────────────────────────────

  async marcarListaParaCobrar(id: number) {
    const comanda = await this.findById(id);

    if (comanda.estado !== EstadoComanda.ABIERTA)
      throw new BadRequestException('Solo se puede pedir cuenta desde una comanda ABIERTA');

    if (comanda.pedidos.length === 0)
      throw new BadRequestException('No se puede pedir cuenta sin pedidos');

    const pedidosInvalidos = comanda.pedidos.filter(
      (p) => !([EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO] as EstadoPedido[]).includes(p.estado),
    );

    if (pedidosInvalidos.length > 0)
      throw new BadRequestException('Existen pedidos pendientes o en preparación');

    const comandaActualizada = await this.prisma.comanda.update({
      where: { id },
      data:  { estado: EstadoComanda.LISTA_PARA_COBRAR },
      include: {
        mesa:    { include: { sector: true } },
        mozo:    { select: { id: true, name: true } },
        pedidos: { include: { articulo: true } },
      },
    });

    this.events.emitListaParaCobrar(comandaActualizada);
    return comandaActualizada;
  }

  // ─────────────────────────────────────────────
  // CAJA CIERRA (COBRA)
  // ─────────────────────────────────────────────

  async cerrar(id: number, cobroDto: CobroDto) {
    const comanda = await this.findById(id);

    if (comanda.estado !== EstadoComanda.LISTA_PARA_COBRAR)
      throw new BadRequestException('La comanda no está lista para cobrar');

    const total = comanda.pedidos.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

    if (cobroDto.montoAbonado < total)
      throw new BadRequestException('El monto abonado es insuficiente');

    const vuelto = cobroDto.montoAbonado - total;

    const [comandaCerrada] = await this.prisma.$transaction([
      this.prisma.comanda.update({
        where: { id },
        data:  { estado: EstadoComanda.CERRADA, total, closedAt: new Date() },
      }),
      this.prisma.mesa.update({
        where: { id: comanda.mesaId },
        data:  { estado: EstadoMesa.LIBRE },
      }),
      this.prisma.cobro.create({
        data: {
          comandaId:     id,
          metodoPago:    cobroDto.metodoPago,
          montoAbonado:  cobroDto.montoAbonado,
          vuelto,
          observaciones: cobroDto.observaciones,
        },
      }),
    ]);

    const resultado = { ...comandaCerrada, total, vuelto };
    this.events.emitComandaCerrada(resultado);
    return resultado;
  }

  // ─────────────────────────────────────────────
  // CANCELAR
  // ─────────────────────────────────────────────

  async cancelar(id: number) {
    const comanda = await this.findById(id);

    if (comanda.estado !== EstadoComanda.ABIERTA)
      throw new BadRequestException('Solo se pueden cancelar comandas ABIERTAS');

    const hayEntregados = comanda.pedidos.some(p => p.estado === EstadoPedido.ENTREGADO);
    if (hayEntregados)
      throw new BadRequestException('No se puede cancelar una comanda con pedidos entregados');

    const [comandaCancelada] = await this.prisma.$transaction([
      this.prisma.comanda.update({
        where: { id },
        data:  { estado: EstadoComanda.CANCELADA, closedAt: new Date() },
      }),
      this.prisma.mesa.update({
        where: { id: comanda.mesaId },
        data:  { estado: EstadoMesa.LIBRE },
      }),
    ]);

    this.events.emitComandaCancelada(comandaCancelada);
    return comandaCancelada;
  }

  // ─────────────────────────────────────────────
  // TICKET
  // ─────────────────────────────────────────────

  async generarTicket(id: number) {
    const comanda = await this.findById(id);
    return this.ticketService.generarTicket(comanda);
  }
}