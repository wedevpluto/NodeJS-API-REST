import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateArticuloDto } from './dto/create-articulo.dto';
import { CategoriaArticulo } from '@prisma/client';

@Injectable()
export class ArticulosService {
  constructor(private prisma: PrismaService) {}

  async findAll(categoria?: CategoriaArticulo) {
    return this.prisma.articulo.findMany({
      where: categoria ? { categoria } : undefined,
      orderBy: { categoria: 'asc' },
    });
  }

  async findById(id: number) {
    const articulo = await this.prisma.articulo.findUnique({ where: { id } });
    if (!articulo) throw new NotFoundException(`Artículo ${id} no encontrado`);
    return articulo;
  }

  async create(dto: CreateArticuloDto) {
    return this.prisma.articulo.create({ data: dto });
  }

  async update(id: number, dto: Partial<CreateArticuloDto>) {
    await this.findById(id);
    return this.prisma.articulo.update({ where: { id }, data: dto });
  }

  async toggleDisponible(id: number) {
    const articulo = await this.findById(id);
    return this.prisma.articulo.update({
      where: { id },
      data: { disponible: !articulo.disponible },
    });
  }

  async delete(id: number) {
    await this.findById(id);
    return this.prisma.articulo.delete({ where: { id } });
  }
}