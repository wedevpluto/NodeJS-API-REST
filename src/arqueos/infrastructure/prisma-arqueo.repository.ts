import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ArqueoRepository } from '../domain/arqueo.repository';
import { Arqueo } from '../domain/arqueo.entity';

@Injectable()
export class PrismaArqueoRepository implements ArqueoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(arqueo: Arqueo) {
    return this.prisma.arqueo.create({
      data: arqueo.toPersistence(),
      include: {
        cajero: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.arqueo.findMany({
      include: {
        cajero: { select: { id: true, name: true, email: true } },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async findById(id: number) {
    return this.prisma.arqueo.findUnique({
      where: { id },
      include: {
        cajero: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findUltimo() {
    return this.prisma.arqueo.findFirst({
      orderBy: { fecha: 'desc' },
      include: {
        cajero: { select: { id: true, name: true, email: true } },
      },
    });
  }
}