import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
  findAll() {
    return this.sectoresService.findAll();
  }

  @Roles('ADMIN')
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.sectoresService.findById(Number(id));
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateSectorDto) {
    return this.sectoresService.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateSectorDto) {
    return this.sectoresService.update(Number(id), dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.sectoresService.delete(Number(id));
  }
}