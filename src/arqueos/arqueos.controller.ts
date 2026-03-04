import { Controller, Get, Post, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ArqueosService } from './application/arqueos.service';
import { CreateArqueoDto } from './dto/create-arqueo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiBearerAuth()
@ApiTags('arqueos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('arqueos')
export class ArqueosController {
  constructor(private arqueosService: ArqueosService) {}

  @Roles('ADMIN', 'CAJERO')
  @Get()
  @ApiOperation({ summary: 'Listar todos los arqueos de caja' })
  @ApiResponse({
    status: 200,
    description: 'Listado completo de arqueos',
    schema: {
      example: [{ id: 1, fecha: '2024-01-01T00:00:00.000Z', totalEfectivo: 50000, totalTarjeta: 30000, totalGeneral: 80000, cajero: { name: 'Carlos' } }],
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  findAll() {
    return this.arqueosService.findAll();
  }

  @Roles('ADMIN', 'CAJERO')
  @Get('ultimo')
  @ApiOperation({ summary: 'Obtener el último arqueo registrado' })
  @ApiResponse({ status: 200, description: 'Último arqueo encontrado' })
  @ApiResponse({ status: 404, description: 'No hay arqueos registrados' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  findUltimo() {
    return this.arqueosService.findUltimo();
  }

  @Roles('ADMIN', 'CAJERO')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener arqueo por ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Arqueo encontrado' })
  @ApiResponse({ status: 404, description: 'Arqueo no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  findById(@Param('id') id: string) {
    return this.arqueosService.findById(Number(id));
  }

  @Roles('ADMIN', 'CAJERO')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo arqueo de caja' })
  @ApiResponse({ status: 201, description: 'Arqueo registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  create(@Body() dto: CreateArqueoDto) {
    return this.arqueosService.create(dto);
  }
}