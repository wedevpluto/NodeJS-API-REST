import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
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
  @ApiQuery({ name: 'estado', enum: EstadoMesa, required: false })
  findAll(@Query('estado') estado?: EstadoMesa) {
    if (estado) return this.mesasService.findByEstado(estado);
    return this.mesasService.findAll();
  }

  @Roles('ADMIN', 'MOZO', 'CAJERO')
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.mesasService.findById(Number(id));
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateMesaDto) {
    return this.mesasService.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateMesaDto) {
    return this.mesasService.update(Number(id), dto);
  }

  @Roles('ADMIN', 'MOZO')
  @Patch(':id/estado')
  cambiarEstado(@Param('id') id: string, @Body('estado') estado: EstadoMesa) {
    return this.mesasService.cambiarEstado(Number(id), estado);
  }

  @Roles('ADMIN')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.mesasService.delete(Number(id));
  }
}