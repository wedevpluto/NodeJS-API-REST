import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateArqueoDto } from './dto/create-arqueo.dto';

@Injectable()
export class ArqueosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.arqueo.findMany({
      include: {
        cajero: { select: { id: true, name: true, email: true } },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async findById(id: number) {
    const arqueo = await this.prisma.arqueo.findUnique({
      where: { id },
      include: {
        cajero: { select: { id: true, name: true, email: true } },
      },
    });
    if (!arqueo) throw new NotFoundException(`Arqueo ${id} no encontrado`);
    return arqueo;
  }

  async findUltimo() {
    return this.prisma.arqueo.findFirst({
      orderBy: { fecha: 'desc' },
      include: {
        cajero: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async create(dto: CreateArqueoDto) {
    const totalGeneral = dto.totalEfectivo + dto.totalTarjeta;

    return this.prisma.arqueo.create({
      data: {
        ...dto,
        totalGeneral,
      },
      include: {
        cajero: { select: { id: true, name: true, email: true } },
      },
    });
  }
}