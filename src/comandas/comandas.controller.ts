import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
  findAll() {
    return this.comandasService.findAll();
  }

  @Roles('ADMIN', 'MOZO', 'CAJERO')
  @Get('abiertas')
  findAbiertas() {
    return this.comandasService.findAbiertas();
  }

  @Roles('ADMIN', 'MOZO', 'CAJERO')
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.comandasService.findById(Number(id));
  }

  @Roles('ADMIN', 'MOZO')
  @Post()
  create(@Body() dto: CreateComandaDto) {
    return this.comandasService.create(dto);
  }

  @Roles('ADMIN', 'CAJERO')
  @Patch(':id/cerrar')
  cerrar(@Param('id') id: string) {
    return this.comandasService.cerrar(Number(id));
  }

  @Roles('ADMIN', 'MOZO')
  @Patch(':id/cancelar')
  cancelar(@Param('id') id: string) {
    return this.comandasService.cancelar(Number(id));
  }
}