import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('reportes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'CAJERO')
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('ventas-diarias')
  @ApiOperation({ summary: 'Ventas del día' })
  @ApiQuery({ name: 'fecha', example: '2026-03-04' })
  @ApiResponse({ status: 200, description: 'Resumen de ventas del día' })
  ventasDiarias(@Query('fecha') fecha: string) {
    return this.reportesService.ventasDiarias(fecha ?? new Date().toISOString().split('T')[0]);
  }

  @Get('ventas-por-mozo')
  @ApiOperation({ summary: 'Ventas agrupadas por mozo' })
  @ApiQuery({ name: 'desde', example: '2026-03-01' })
  @ApiQuery({ name: 'hasta', example: '2026-03-04' })
  @ApiResponse({ status: 200, description: 'Ranking de ventas por mozo' })
  ventasPorMozo(@Query('desde') desde: string, @Query('hasta') hasta: string) {
    const hoy = new Date().toISOString().split('T')[0];
    return this.reportesService.ventasPorMozo(desde ?? hoy, hasta ?? hoy);
  }

  @Get('metodos-de-pago')
  @ApiOperation({ summary: 'Ventas agrupadas por método de pago' })
  @ApiQuery({ name: 'desde', example: '2026-03-01' })
  @ApiQuery({ name: 'hasta', example: '2026-03-04' })
  @ApiResponse({ status: 200, description: 'Totales por método de pago' })
  ventasPorMetodoPago(@Query('desde') desde: string, @Query('hasta') hasta: string) {
    const hoy = new Date().toISOString().split('T')[0];
    return this.reportesService.ventasPorMetodoPago(desde ?? hoy, hasta ?? hoy);
  }

  @Get('articulos-mas-vendidos')
  @ApiOperation({ summary: 'Ranking de artículos más vendidos' })
  @ApiQuery({ name: 'desde',  example: '2026-03-01' })
  @ApiQuery({ name: 'hasta',  example: '2026-03-04' })
  @ApiQuery({ name: 'limit',  example: 10, required: false })
  @ApiResponse({ status: 200, description: 'Ranking de artículos por cantidad vendida' })
  articulosMasVendidos(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
    @Query('limit') limit?: number,
  ) {
    const hoy = new Date().toISOString().split('T')[0];
    return this.reportesService.articulosMasVendidos(desde ?? hoy, hasta ?? hoy, limit);
  }
}