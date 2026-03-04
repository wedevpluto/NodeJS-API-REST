import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { EstadoMesa } from '@prisma/client';

@Injectable()
export class MesasService {
  constructor(private prisma: PrismaService) {}

  async findAll(sectorId?: number, estado?: EstadoMesa) {
    return this.prisma.mesa.findMany({
      where: {
        ...(sectorId && { sectorId }),
        ...(estado   && { estado   }),
      },
      include: { sector: true },
      orderBy: { numero: 'asc' },
    });
  }

  async findById(id: number) {
    const mesa = await this.prisma.mesa.findUnique({
      where: { id },
      include: { sector: true },
    });
    if (!mesa) throw new NotFoundException(`Mesa ${id} no encontrada`);
    return mesa;
  }

  async findByEstado(estado: EstadoMesa) {
    return this.prisma.mesa.findMany({
      where: { estado },
      include: { sector: true },
    });
  }

  async create(dto: CreateMesaDto) {
    const existe = await this.prisma.mesa.findUnique({ where: { numero: dto.numero } });
    if (existe) throw new ConflictException(`La mesa ${dto.numero} ya existe`);
    return this.prisma.mesa.create({ data: dto });
  }

  async update(id: number, dto: Partial<CreateMesaDto>) {
    await this.findById(id);
    return this.prisma.mesa.update({ where: { id }, data: dto });
  }

  async cambiarEstado(id: number, estado: EstadoMesa) {
    await this.findById(id);
    return this.prisma.mesa.update({ where: { id }, data: { estado } });
  }

  async delete(id: number) {
    await this.findById(id);
    return this.prisma.mesa.delete({ where: { id } });
  }
}