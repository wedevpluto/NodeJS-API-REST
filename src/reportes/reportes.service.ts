import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  // ─── Ventas por día ──────────────────────────────────────
  async ventasDiarias(fecha: string) {
    const inicio = new Date(fecha);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(fecha);
    fin.setHours(23, 59, 59, 999);

    const comandas = await this.prisma.comanda.findMany({
      where: {
        estado: 'CERRADA',
        closedAt: { gte: inicio, lte: fin },
      },
      include: {
        cobro: true,
        pedidos: { include: { articulo: true } },
        mozo: { select: { id: true, name: true } },
      },
    });

    const totalGeneral = comandas.reduce((sum, c) => sum + (c.total ?? 0), 0);

    return {
      fecha,
      totalComandas: comandas.length,
      totalGeneral,
      comandas,
    };
  }

  // ─── Ventas por mozo ─────────────────────────────────────
  async ventasPorMozo(desde: string, hasta: string) {
    const inicio = new Date(desde);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(hasta);
    fin.setHours(23, 59, 59, 999);

    const comandas = await this.prisma.comanda.findMany({
      where: {
        estado: 'CERRADA',
        closedAt: { gte: inicio, lte: fin },
      },
      include: {
        mozo: { select: { id: true, name: true } },
      },
    });

    // Agrupar por mozo
    const porMozo = new Map<number, { id: number; name: string; totalComandas: number; totalVentas: number }>();

    for (const comanda of comandas) {
      const { id, name } = comanda.mozo;
      if (!porMozo.has(id)) {
        porMozo.set(id, { id, name, totalComandas: 0, totalVentas: 0 });
      }
      const entry = porMozo.get(id)!;
      entry.totalComandas++;
      entry.totalVentas += comanda.total ?? 0;
    }

    return {
      desde,
      hasta,
      mozos: Array.from(porMozo.values()).sort((a, b) => b.totalVentas - a.totalVentas),
    };
  }

  // ─── Ventas por método de pago ───────────────────────────
  async ventasPorMetodoPago(desde: string, hasta: string) {
    const inicio = new Date(desde);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(hasta);
    fin.setHours(23, 59, 59, 999);

    const cobros = await this.prisma.cobro.findMany({
      where: {
        comanda: {
          estado: 'CERRADA',
          closedAt: { gte: inicio, lte: fin },
        },
      },
    });

    // Agrupar por método de pago
    const porMetodo = new Map<string, { metodo: string; totalTransacciones: number; totalMonto: number }>();

    for (const cobro of cobros) {
      const metodo = cobro.metodoPago;
      if (!porMetodo.has(metodo)) {
        porMetodo.set(metodo, { metodo, totalTransacciones: 0, totalMonto: 0 });
      }
      const entry = porMetodo.get(metodo)!;
      entry.totalTransacciones++;
      entry.totalMonto += cobro.montoAbonado;
    }

    const totalGeneral = cobros.reduce((sum, c) => sum + c.montoAbonado, 0);

    return {
      desde,
      hasta,
      totalGeneral,
      metodos: Array.from(porMetodo.values()).sort((a, b) => b.totalMonto - a.totalMonto),
    };
  }

  // ─── Artículos más vendidos ──────────────────────────────
  async articulosMasVendidos(desde: string, hasta: string, limit = 10) {
    const inicio = new Date(desde);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(hasta);
    fin.setHours(23, 59, 59, 999);

    const pedidos = await this.prisma.pedido.findMany({
      where: {
        estado: 'ENTREGADO',
        comanda: {
          estado: 'CERRADA',
          closedAt: { gte: inicio, lte: fin },
        },
      },
      include: {
        articulo: { select: { id: true, nombre: true, categoria: true } },
      },
    });

    // Agrupar por artículo
    const porArticulo = new Map<number, {
      id: number;
      nombre: string;
      categoria: string;
      cantidadVendida: number;
      totalRecaudado: number;
    }>();

    for (const pedido of pedidos) {
      const { id, nombre, categoria } = pedido.articulo;
      if (!porArticulo.has(id)) {
        porArticulo.set(id, { id, nombre, categoria, cantidadVendida: 0, totalRecaudado: 0 });
      }
      const entry = porArticulo.get(id)!;
      entry.cantidadVendida += pedido.cantidad;
      entry.totalRecaudado  += pedido.precio * pedido.cantidad;
    }

    const ranking = Array.from(porArticulo.values())
      .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
      .slice(0, limit);

    return {
      desde,
      hasta,
      ranking,
    };
  }
}