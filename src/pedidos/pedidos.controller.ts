import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EstadoPedido } from '@prisma/client';

@ApiBearerAuth()
@ApiTags('pedidos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pedidos')
export class PedidosController {
  constructor(private pedidosService: PedidosService) {}

  @Roles('ADMIN', 'MOZO', 'CAJERO')
  @Get()
  @ApiOperation({ summary: 'Listar pedidos de una comanda' })
  @ApiQuery({ name: 'comandaId', required: true, type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Listado de pedidos de la comanda',
    schema: {
      example: [{ id: 1, cantidad: 2, precio: 1500, estado: 'PENDIENTE', nota: 'Sin sal', articulo: { nombre: 'Milanesa' } }],
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findByComanda(@Query('comandaId') comandaId: string) {
    return this.pedidosService.findByComanda(Number(comandaId));
  }

  @Roles('ADMIN', 'MOZO', 'CAJERO')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener pedido por ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Pedido encontrado' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  findById(@Param('id') id: string) {
    return this.pedidosService.findById(Number(id));
  }

  @Roles('ADMIN', 'MOZO')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agregar ítem a una comanda' })
  @ApiResponse({ status: 201, description: 'Pedido registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Comanda cerrada o artículo no disponible' })
  @ApiResponse({ status: 404, description: 'Comanda o artículo no encontrado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  create(@Body() dto: CreatePedidoDto) {
    return this.pedidosService.create(dto);
  }

  @Roles('ADMIN', 'MOZO')
  @Patch(':id/estado')
  @ApiOperation({ summary: 'Actualizar estado de un pedido' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiQuery({ name: 'estado', enum: EstadoPedido })
  @ApiResponse({ status: 200, description: 'Estado actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  cambiarEstado(@Param('id') id: string, @Query('estado') estado: EstadoPedido) {
    return this.pedidosService.cambiarEstado(Number(id), estado);
  }

  @Roles('ADMIN', 'MOZO')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar pedido en estado PENDIENTE' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 204, description: 'Pedido eliminado exitosamente' })
  @ApiResponse({ status: 400, description: 'Solo se pueden eliminar pedidos en estado PENDIENTE' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  delete(@Param('id') id: string) {
    return this.pedidosService.delete(Number(id));
  }
}