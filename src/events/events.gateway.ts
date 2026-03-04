import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/events',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  // El cliente se une a una sala según su rol/sector
  @SubscribeMessage('join')
  handleJoin(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
    client.join(room);
    console.log(`Cliente ${client.id} se unió a sala: ${room}`);
    return { event: 'joined', room };
  }

  // ─── Métodos para emitir eventos desde los services ──────

  // Nuevo pedido → cocina y barra
  emitNuevoPedido(pedido: any) {
    this.server.to('cocina').emit('pedido.nuevo', pedido);
    this.server.to('barra').emit('pedido.nuevo', pedido);
  }

  // Cambio de estado de pedido → mozo
  emitEstadoPedido(pedido: any) {
    this.server.to('mozos').emit('pedido.estado', pedido);
  }

  // Comanda cerrada → cajero
  emitComandaCerrada(comanda: any) {
    this.server.to('caja').emit('comanda.cerrada', comanda);
  }

  // Comanda cancelada → cajero y mozos
  emitComandaCancelada(comanda: any) {
    this.server.to('caja').emit('comanda.cancelada', comanda);
    this.server.to('mozos').emit('comanda.cancelada', comanda);
  }

  // Mozo pide cuenta → cajero
  emitListaParaCobrar(comanda: any) {
    this.server.to('caja').emit('comanda.lista_para_cobrar', comanda);
  }
}