import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateComandaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  mesaId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  mozoId: number;
}