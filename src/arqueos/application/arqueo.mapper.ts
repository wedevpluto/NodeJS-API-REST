import { CreateArqueoDto } from '../dto/create-arqueo.dto';
import { Arqueo } from '../domain/arqueo.entity';

export class ArqueoMapper {
  static fromDto(dto: CreateArqueoDto): Arqueo {
    return Arqueo.crear({
      ...dto,
    });
  }
}