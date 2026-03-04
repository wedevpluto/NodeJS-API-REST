import { Controller, Get, Post, Patch, Param, Body, UseGuards, HttpCode, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ComandasService } from './comandas.service';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { CobroDto } from './dto/cobro.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiBearerAuth()
@ApiTags('comandas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('comandas')
export class ComandasController {
  constructor(private comandasService: ComandasService) { }

  @Roles('ADMIN', 'CAJERO')
  @Get()
  @ApiOperation({ summary: 'Listar todas las comandas' })
  @ApiResponse({ status: 200, description: 'Listado completo de comandas' })
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

  @Roles('ADMIN', 'CAJERO')
  @Get('listas-para-cobrar')
  @ApiOperation({ summary: 'Listar comandas listas para cobrar' })
  @ApiResponse({ status: 200, description: 'Listado de comandas listas para cobrar' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findListasParaCobrar() {
    return this.comandasService.findListasParaCobrar();
  }

  @Roles('ADMIN', 'MOZO', 'CAJERO')
  @Get(':id/ticket')
  @ApiOperation({ summary: 'Obtener ticket de una comanda en formato ESC/POS' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Ticket en texto plano listo para impresora térmica' })
  @ApiResponse({ status: 404, description: 'Comanda no encontrada' })
  async ticket(@Param('id') id: string, @Res() res: Response) {
    const texto = await this.comandasService.generarTicket(Number(id));
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(texto);
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
  @ApiOperation({ summary: 'Abrir nueva comanda en una mesa con pedidos opcionales' })
  @ApiResponse({ status: 201, description: 'Comanda abierta exitosamente' })
  @ApiResponse({ status: 400, description: 'La mesa ya está ocupada' })
  @ApiResponse({ status: 404, description: 'Mesa, mozo o artículo no encontrado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  create(@Body() dto: CreateComandaDto) {
    return this.comandasService.create(dto);
  }

  @Roles('ADMIN', 'MOZO')
  @Patch(':id/pedir-cuenta')
  @ApiOperation({ summary: 'Mozo marca la comanda como lista para cobrar' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Comanda marcada como lista para cobrar' })
  @ApiResponse({ status: 400, description: 'La comanda no está abierta o tiene pedidos pendientes' })
  @ApiResponse({ status: 404, description: 'Comanda no encontrada' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  pedirCuenta(@Param('id') id: string) {
    return this.comandasService.marcarListaParaCobrar(Number(id));
  }

  @Roles('ADMIN', 'CAJERO')
  @Patch(':id/cerrar')
  @ApiOperation({ summary: 'Cerrar comanda, registrar cobro y liberar mesa' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Comanda cerrada exitosamente' })
  @ApiResponse({ status: 400, description: 'La comanda no está lista para cobrar' })
  @ApiResponse({ status: 404, description: 'Comanda no encontrada' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  cerrar(@Param('id') id: string, @Body() cobroDto: CobroDto) {
    return this.comandasService.cerrar(Number(id), cobroDto);
  }

  @Roles('ADMIN', 'MOZO')
  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar comanda y liberar mesa' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Comanda cancelada exitosamente' })
  @ApiResponse({ status: 400, description: 'La comanda no está abierta o tiene entregados' })
  @ApiResponse({ status: 404, description: 'Comanda no encontrada' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  cancelar(@Param('id') id: string) {
    return this.comandasService.cancelar(Number(id));
  }
}