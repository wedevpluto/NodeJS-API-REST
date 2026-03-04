import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ARQUEO_REPOSITORY } from '../domain/arqueo.repository';
import type { ArqueoRepository } from '../domain/arqueo.repository';
import { CreateArqueoDto } from '../dto/create-arqueo.dto';
import { ArqueoMapper } from './arqueo.mapper';

@Injectable()
export class ArqueosService {
  constructor(
    @Inject(ARQUEO_REPOSITORY)
    private readonly repository: ArqueoRepository,
  ) {}

  async create(dto: CreateArqueoDto) {
    const arqueo = ArqueoMapper.fromDto(dto);
    return this.repository.save(arqueo);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: number) {
    const arqueo = await this.repository.findById(id);
    if (!arqueo) {
      throw new NotFoundException(`Arqueo ${id} no encontrado`);
    }
    return arqueo;
  }

  async findUltimo() {
    return this.repository.findUltimo();
  }
}