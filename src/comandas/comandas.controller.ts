import { Controller, Get, Post, Patch, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ComandasService } from './comandas.service';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiBearerAuth()
@ApiTags('comandas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('comandas')
export class ComandasController {
  constructor(private comandasService: ComandasService) {}

  @Roles('ADMIN', 'CAJERO')
  @Get()
  @ApiOperation({ summary: 'Listar todas las comandas' })
  @ApiResponse({
    status: 200,
    description: 'Listado completo de comandas',
    schema: {
      example: [{ id: 1, estado: 'ABIERTA', total: 0, mesa: { numero: 1 }, mozo: { name: 'Juan' }, pedidos: [] }],
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  findAll() {
    return this.comandasService.findAll();
  }

  @Roles('ADMIN', 'MOZO', 'CAJERO')
  @Get('abiertas')
  @ApiOperation({ summary: 'Listar comandas actualmente abiertas' })
  @ApiResponse({ status: 200, description: 'Listado de comandas abiertas' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findAbiertas() {
    return this.comandasService.findAbiertas();
  }

  @Roles('ADMIN', 'MOZO', 'CAJERO')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener comanda por ID con sus pedidos' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Comanda encontrada' })
  @ApiResponse({ status: 404, description: 'Comanda no encontrada' })
  findById(@Param('id') id: string) {
    return this.comandasService.findById(Number(id));
  }

  @Roles('ADMIN', 'MOZO')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Abrir nueva comanda en una mesa' })
  @ApiResponse({ status: 201, description: 'Comanda abierta exitosamente' })
  @ApiResponse({ status: 400, description: 'La mesa ya está ocupada' })
  @ApiResponse({ status: 404, description: 'Mesa o mozo no encontrado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  create(@Body() dto: CreateComandaDto) {
    return this.comandasService.create(dto);
  }

  @Roles('ADMIN', 'CAJERO')
  @Patch(':id/cerrar')
  @ApiOperation({ summary: 'Cerrar comanda y calcular total' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Comanda cerrada y mesa liberada exitosamente' })
  @ApiResponse({ status: 400, description: 'La comanda ya está cerrada o cancelada' })
  @ApiResponse({ status: 404, description: 'Comanda no encontrada' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  cerrar(@Param('id') id: string) {
    return this.comandasService.cerrar(Number(id));
  }

  @Roles('ADMIN', 'MOZO')
  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar comanda y liberar mesa' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Comanda cancelada y mesa liberada exitosamente' })
  @ApiResponse({ status: 400, description: 'La comanda ya está cerrada o cancelada' })
  @ApiResponse({ status: 404, description: 'Comanda no encontrada' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  cancelar(@Param('id') id: string) {
    return this.comandasService.cancelar(Number(id));
  }
}