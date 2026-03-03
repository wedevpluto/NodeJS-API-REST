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
    // 1. Suma de todos los métodos de pago = totalGeneral real
    const totalGeneral =
      (dto.totalEfectivo           ?? 0) +
      (dto.totalDebito             ?? 0) +
      (dto.totalCredito            ?? 0) +
      (dto.totalTransferencia      ?? 0) +
      (dto.totalQr                 ?? 0) +
      (dto.totalPedidosYaCtaCte    ?? 0) +
      (dto.totalPedidosYaEfectivo  ?? 0) +
      (dto.totalRappiCtaCte        ?? 0) +
      (dto.totalRappiEfectivo      ?? 0);

    // 2. Efectivo contado físicamente en billetes
    const efectivoContado =
      ((dto.billetes1000  ?? 0) * 1000)  +
      ((dto.billetes2000  ?? 0) * 2000)  +
      ((dto.billetes5000  ?? 0) * 5000)  +
      ((dto.billetes10000 ?? 0) * 10000) +
      ((dto.billetes20000 ?? 0) * 20000) +
      ((dto.billetes50000 ?? 0) * 50000);

    // 3. Diferencia: positivo = sobra efectivo / negativo = falta efectivo
    const diferencia = efectivoContado - dto.totalEfectivo;

    return this.prisma.arqueo.create({
      data: {
        cajeroId:               dto.cajeroId,
        billetes1000:           dto.billetes1000  ?? 0,
        billetes2000:           dto.billetes2000  ?? 0,
        billetes5000:           dto.billetes5000  ?? 0,
        billetes10000:          dto.billetes10000 ?? 0,
        billetes20000:          dto.billetes20000 ?? 0,
        billetes50000:          dto.billetes50000 ?? 0,
        totalEfectivo:          dto.totalEfectivo,
        totalDebito:            dto.totalDebito            ?? 0,
        totalCredito:           dto.totalCredito           ?? 0,
        totalTransferencia:     dto.totalTransferencia     ?? 0,
        totalQr:                dto.totalQr                ?? 0,
        totalPedidosYaCtaCte:   dto.totalPedidosYaCtaCte   ?? 0,
        totalPedidosYaEfectivo: dto.totalPedidosYaEfectivo ?? 0,
        totalRappiCtaCte:       dto.totalRappiCtaCte       ?? 0,
        totalRappiEfectivo:     dto.totalRappiEfectivo     ?? 0,
        totalGeneral,
        diferencia,
        observaciones:          dto.observaciones,
      },
      include: {
        cajero: { select: { id: true, name: true, email: true } },
      },
    });
  }
}