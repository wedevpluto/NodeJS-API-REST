import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
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
  @ApiQuery({ name: 'comandaId', required: true, type: Number })
  findByComanda(@Query('comandaId') comandaId: string) {
    return this.pedidosService.findByComanda(Number(comandaId));
  }

  @Roles('ADMIN', 'MOZO', 'CAJERO')
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.pedidosService.findById(Number(id));
  }

  @Roles('ADMIN', 'MOZO')
  @Post()
  create(@Body() dto: CreatePedidoDto) {
    return this.pedidosService.create(dto);
  }

  @Roles('ADMIN', 'MOZO')
  @Patch(':id/estado')
  @ApiQuery({ name: 'estado', enum: EstadoPedido })
  cambiarEstado(@Param('id') id: string, @Query('estado') estado: EstadoPedido) {
    return this.pedidosService.cambiarEstado(Number(id), estado);
  }

  @Roles('ADMIN', 'MOZO')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.pedidosService.delete(Number(id));
  }
}