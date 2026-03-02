import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ArticulosService } from './articulos.service';
import { CreateArticuloDto } from './articulos/dto/create-articulo.dto';
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
  @ApiQuery({ name: 'categoria', enum: CategoriaArticulo, required: false })
  findAll(@Query('categoria') categoria?: CategoriaArticulo) {
    return this.articulosService.findAll(categoria);
  }

  @Roles('ADMIN', 'MOZO', 'CAJERO')
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.articulosService.findById(Number(id));
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateArticuloDto) {
    return this.articulosService.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateArticuloDto) {
    return this.articulosService.update(Number(id), dto);
  }

  @Roles('ADMIN')
  @Patch(':id/disponible')
  toggleDisponible(@Param('id') id: string) {
    return this.articulosService.toggleDisponible(Number(id));
  }

  @Roles('ADMIN')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.articulosService.delete(Number(id));
  }
}