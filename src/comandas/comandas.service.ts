import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { EstadoComanda, EstadoMesa } from '@prisma/client';

@Injectable()
export class ComandasService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.comanda.findMany({
      include: {
        mesa: { include: { sector: true } },
        mozo: { select: { id: true, name: true, email: true } },
        pedidos: { include: { articulo: true } },
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
      },
    });
    if (!comanda) throw new NotFoundException(`Comanda ${id} no encontrada`);
    return comanda;
  }

  async findAbiertas() {
    return this.prisma.comanda.findMany({
      where: { estado: EstadoComanda.ABIERTA },
      include: {
        mesa: { include: { sector: true } },
        mozo: { select: { id: true, name: true } },
        pedidos: { include: { articulo: true } },
      },
    });
  }

  async create(dto: CreateComandaDto) {
    const mesa = await this.prisma.mesa.findUnique({ where: { id: dto.mesaId } });
    if (!mesa) throw new NotFoundException(`Mesa ${dto.mesaId} no encontrada`);
    if (mesa.estado === EstadoMesa.OCUPADA)
      throw new BadRequestException(`La mesa ${mesa.numero} ya está ocupada`);

    const [comanda] = await this.prisma.$transaction([
      this.prisma.comanda.create({ data: dto }),
      this.prisma.mesa.update({
        where: { id: dto.mesaId },
        data: { estado: EstadoMesa.OCUPADA },
      }),
    ]);

    return comanda;
  }

  async cerrar(id: number) {
    const comanda = await this.findById(id);
    if (comanda.estado !== EstadoComanda.ABIERTA)
      throw new BadRequestException('La comanda ya está cerrada o cancelada');

    const total = comanda.pedidos.reduce(
      (sum, p) => sum + p.precio * p.cantidad, 0
    );

    const [comandaCerrada] = await this.prisma.$transaction([
      this.prisma.comanda.update({
        where: { id },
        data: { estado: EstadoComanda.CERRADA, total, closedAt: new Date() },
      }),
      this.prisma.mesa.update({
        where: { id: comanda.mesaId },
        data: { estado: EstadoMesa.LIBRE },
      }),
    ]);

    return comandaCerrada;
  }

  async cancelar(id: number) {
    const comanda = await this.findById(id);
    if (comanda.estado !== EstadoComanda.ABIERTA)
      throw new BadRequestException('La comanda ya está cerrada o cancelada');

    const [comandaCancelada] = await this.prisma.$transaction([
      this.prisma.comanda.update({
        where: { id },
        data: { estado: EstadoComanda.CANCELADA, closedAt: new Date() },
      }),
      this.prisma.mesa.update({
        where: { id: comanda.mesaId },
        data: { estado: EstadoMesa.LIBRE },
      }),
    ]);

    return comandaCancelada;
  }
}