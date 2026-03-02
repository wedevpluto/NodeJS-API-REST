import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { EstadoComanda, EstadoPedido } from '@prisma/client';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

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
    if (!pedido) throw new NotFoundException(`Pedido ${id} no encontrado`);
    return pedido;
  }

  async create(dto: CreatePedidoDto) {
    const comanda = await this.prisma.comanda.findUnique({ where: { id: dto.comandaId } });
    if (!comanda) throw new NotFoundException(`Comanda ${dto.comandaId} no encontrada`);
    if (comanda.estado !== EstadoComanda.ABIERTA)
      throw new BadRequestException('No se pueden agregar pedidos a una comanda cerrada o cancelada');

    const articulo = await this.prisma.articulo.findUnique({ where: { id: dto.articuloId } });
    if (!articulo) throw new NotFoundException(`Artículo ${dto.articuloId} no encontrado`);
    if (!articulo.disponible)
      throw new BadRequestException(`El artículo "${articulo.nombre}" no está disponible`);

    return this.prisma.pedido.create({
      data: {
        comandaId: dto.comandaId,
        articuloId: dto.articuloId,
        cantidad: dto.cantidad,
        precio: articulo.precio,
        nota: dto.nota,
      },
      include: { articulo: true },
    });
  }

  async cambiarEstado(id: number, estado: EstadoPedido) {
    await this.findById(id);
    return this.prisma.pedido.update({
      where: { id },
      data: { estado },
      include: { articulo: true },
    });
  }

  async delete(id: number) {
    const pedido = await this.findById(id);
    if (pedido.estado !== EstadoPedido.PENDIENTE)
      throw new BadRequestException('Solo se pueden eliminar pedidos en estado PENDIENTE');
    return this.prisma.pedido.delete({ where: { id } });
  }
}