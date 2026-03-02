import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { MesasService } from './mesas.service';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EstadoMesa } from '@prisma/client';

@ApiBearerAuth()
@ApiTags('mesas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('mesas')
export class MesasController {
  constructor(private mesasService: MesasService) {}

  @Roles('ADMIN', 'MOZO', 'CAJERO')
  @Get()
  @ApiOperation({ summary: 'Listar mesas con estado actual (filtrable por estado)' })
  @ApiQuery({ name: 'estado', enum: EstadoMesa, required: false })
  @ApiResponse({
    status: 200,
    description: 'Listado de mesas',
    schema: {
      example: [{ id: 1, numero: 1, capacidad: 4, estado: 'LIBRE', sector: { id: 1, nombre: 'Salón' } }],
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findAll(@Query('estado') estado?: EstadoMesa) {
    if (estado) return this.mesasService.findByEstado(estado);
    return this.mesasService.findAll();
  }

  @Roles('ADMIN', 'MOZO', 'CAJERO')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener mesa por ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Mesa encontrada' })
  @ApiResponse({ status: 404, description: 'Mesa no encontrada' })
  findById(@Param('id') id: string) {
    return this.mesasService.findById(Number(id));
  }

  @Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nueva mesa' })
  @ApiResponse({ status: 201, description: 'Mesa creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El número de mesa ya existe' })
  create(@Body() dto: CreateMesaDto) {
    return this.mesasService.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de una mesa' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Mesa actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Mesa no encontrada' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  update(@Param('id') id: string, @Body() dto: CreateMesaDto) {
    return this.mesasService.update(Number(id), dto);
  }

  @Roles('ADMIN', 'MOZO')
  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar estado de una mesa' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({
    schema: {
      example: { estado: 'OCUPADA' },
    },
  })
  @ApiResponse({ status: 200, description: 'Estado actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Mesa no encontrada' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  cambiarEstado(@Param('id') id: string, @Body('estado') estado: EstadoMesa) {
    return this.mesasService.cambiarEstado(Number(id), estado);
  }

  @Roles('ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar mesa' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 204, description: 'Mesa eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Mesa no encontrada' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  delete(@Param('id') id: string) {
    return this.mesasService.delete(Number(id));
  }
}