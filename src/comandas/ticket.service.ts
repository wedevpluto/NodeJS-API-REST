import { Injectable } from '@nestjs/common';

@Injectable()
export class TicketService {
  private readonly ANCHO = 32; // caracteres ancho ticket 58mm

  private linea(char = '-') {
    return char.repeat(this.ANCHO) + '\n';
  }

  private centrar(texto: string) {
    const espacios = Math.max(0, Math.floor((this.ANCHO - texto.length) / 2));
    return ' '.repeat(espacios) + texto + '\n';
  }

  private izquierdaDerecha(izq: string, der: string) {
    const espacios = Math.max(1, this.ANCHO - izq.length - der.length);
    return izq + ' '.repeat(espacios) + der + '\n';
  }

  generarTicket(comanda: any, nombreLocal = 'MI RESTAURANTE') {
    const fecha = new Date(comanda.closedAt ?? comanda.createdAt);
    const fechaStr = fecha.toLocaleDateString('es-AR');
    const horaStr  = fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    let ticket = '';

    // ─── Encabezado ──────────────────────────────────
    ticket += '\n';
    ticket += this.centrar(nombreLocal.toUpperCase());
    ticket += this.linea();
    ticket += this.centrar(`Comanda #${comanda.id}`);
    ticket += this.centrar(`${fechaStr} ${horaStr}`);
    ticket += this.linea();

    // ─── Info de mesa ─────────────────────────────────
    ticket += this.izquierdaDerecha('Mesa:', `${comanda.mesa?.numero ?? '-'}`);
    ticket += this.izquierdaDerecha('Sector:', `${comanda.mesa?.sector?.nombre ?? '-'}`);
    ticket += this.izquierdaDerecha('Mozo:', `${comanda.mozo?.name ?? '-'}`);
    if (comanda.comensales) {
      ticket += this.izquierdaDerecha('Comensales:', `${comanda.comensales}`);
    }
    ticket += this.linea();

    // ─── Pedidos ──────────────────────────────────────
    ticket += this.centrar('DETALLE');
    ticket += this.linea();

    for (const pedido of comanda.pedidos ?? []) {
      const nombre   = pedido.articulo?.nombre ?? 'Artículo';
      const cantidad = `${pedido.cantidad}x`;
      const precio   = `$${(pedido.precio * pedido.cantidad).toFixed(2)}`;

      // Línea: "2x Milanesa           $3000.00"
      ticket += this.izquierdaDerecha(`${cantidad} ${nombre}`, precio);

      if (pedido.nota) {
        ticket += `   * ${pedido.nota}\n`;
      }
    }

    ticket += this.linea();

    // ─── Total ────────────────────────────────────────
    ticket += this.izquierdaDerecha('TOTAL:', `$${(comanda.total ?? 0).toFixed(2)}`);

    // ─── Cobro (solo si está cerrada) ─────────────────
    if (comanda.cobro) {
      ticket += this.linea('-');
      ticket += this.izquierdaDerecha('Método:', comanda.cobro.metodoPago.replace(/_/g, ' '));
      ticket += this.izquierdaDerecha('Abonado:', `$${comanda.cobro.montoAbonado.toFixed(2)}`);
      if (comanda.cobro.vuelto > 0) {
        ticket += this.izquierdaDerecha('Vuelto:', `$${comanda.cobro.vuelto.toFixed(2)}`);
      }
      if (comanda.cobro.observaciones) {
        ticket += `Obs: ${comanda.cobro.observaciones}\n`;
      }
    }

    ticket += this.linea();
    ticket += this.centrar('¡Gracias por su visita!');
    ticket += '\n\n\n'; // espacio para corte de papel

    return ticket;
  }
}