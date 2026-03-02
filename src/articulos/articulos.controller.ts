import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ArticulosService } from './articulos.service';
import { CreateArticuloDto } from './dto/create-articulo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CategoriaArticulo } from '@prisma/client';

@ApiBearerAuth()
@ApiTags('articulos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('articulos')
export class ArticulosController {
  constructor(private articulosService: ArticulosService) {}

  @Roles('ADMIN', 'MOZO', 'CAJERO')
  @Get()
  @ApiOperation({ summary: 'Listar artículos del menú (filtrable por categoría)' })
  @ApiQuery({ name: 'categoria', enum: CategoriaArticulo, required: false })
  @ApiResponse({
    status: 200,
    description: 'Listado de artículos',
    schema: {
      example: [{ id: 1, nombre: 'Milanesa con papas', precio: 1500, categoria: 'COMIDA', disponible: true }],
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findAll(@Query('categoria') categoria?: CategoriaArticulo) {
    return this.articulosService.findAll(categoria);
  }

  @Roles('ADMIN', 'MOZO', 'CAJERO')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener artículo por ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Artículo encontrado' })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado' })
  findById(@Param('id') id: string) {
    return this.articulosService.findById(Number(id));
  }

  @Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo artículo en el menú' })
  @ApiResponse({ status: 201, description: 'Artículo creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  create(@Body() dto: CreateArticuloDto) {
    return this.articulosService.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de un artículo' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Artículo actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  update(@Param('id') id: string, @Body() dto: CreateArticuloDto) {
    return this.articulosService.update(Number(id), dto);
  }

  @Roles('ADMIN')
  @Patch(':id/disponible')
  @ApiOperation({ summary: 'Alternar disponibilidad de un artículo' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Disponibilidad actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  toggleDisponible(@Param('id') id: string) {
    return this.articulosService.toggleDisponible(Number(id));
  }

  @Roles('ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar artículo del menú' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 204, description: 'Artículo eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  delete(@Param('id') id: string) {
    return this.articulosService.delete(Number(id));
  }
}