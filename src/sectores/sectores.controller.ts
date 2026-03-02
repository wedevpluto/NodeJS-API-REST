import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SectoresService } from './sectores.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiBearerAuth()
@ApiTags('sectores')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sectores')
export class SectoresController {
  constructor(private sectoresService: SectoresService) {}

  @Roles('ADMIN')
  @Get()
  @ApiOperation({ summary: 'Listar todos los sectores con sus mesas' })
  @ApiResponse({
    status: 200,
    description: 'Listado de sectores',
    schema: {
      example: [{ id: 1, nombre: 'Salón principal', mesas: [{ id: 1, numero: 1, capacidad: 4, estado: 'LIBRE' }] }],
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  findAll() {
    return this.sectoresService.findAll();
  }

  @Roles('ADMIN')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener sector por ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Sector encontrado' })
  @ApiResponse({ status: 404, description: 'Sector no encontrado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  findById(@Param('id') id: string) {
    return this.sectoresService.findById(Number(id));
  }

  @Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo sector' })
  @ApiResponse({ status: 201, description: 'Sector creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El sector ya existe' })
  create(@Body() dto: CreateSectorDto) {
    return this.sectoresService.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar nombre de un sector' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Sector actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Sector no encontrado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  update(@Param('id') id: string, @Body() dto: CreateSectorDto) {
    return this.sectoresService.update(Number(id), dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar sector' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 204, description: 'Sector eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Sector no encontrado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  delete(@Param('id') id: string) {
    return this.sectoresService.delete(Number(id));
  }
}