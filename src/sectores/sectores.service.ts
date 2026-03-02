import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSectorDto } from './dto/create-sector.dto';

@Injectable()
export class SectoresService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.sector.findMany({
      include: { mesas: true },
    });
  }

  async findById(id: number) {
    const sector = await this.prisma.sector.findUnique({
      where: { id },
      include: { mesas: true },
    });
    if (!sector) throw new NotFoundException(`Sector ${id} no encontrado`);
    return sector;
  }

  async create(dto: CreateSectorDto) {
    const existe = await this.prisma.sector.findUnique({
      where: { nombre: dto.nombre },
    });
    if (existe) throw new ConflictException(`El sector "${dto.nombre}" ya existe`);
    return this.prisma.sector.create({ data: dto });
  }

  async update(id: number, dto: CreateSectorDto) {
    await this.findById(id);
    return this.prisma.sector.update({ where: { id }, data: dto });
  }

  async delete(id: number) {
    await this.findById(id);
    return this.prisma.sector.delete({ where: { id } });
  }
}