import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ArqueosService } from './arqueos.service';
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
  findAll() {
    return this.arqueosService.findAll();
  }

  @Roles('ADMIN', 'CAJERO')
  @Get('ultimo')
  findUltimo() {
    return this.arqueosService.findUltimo();
  }

  @Roles('ADMIN', 'CAJERO')
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.arqueosService.findById(Number(id));
  }

  @Roles('ADMIN', 'CAJERO')
  @Post()
  create(@Body() dto: CreateArqueoDto) {
    return this.arqueosService.create(dto);
  }
}