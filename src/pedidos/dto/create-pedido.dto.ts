import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePedidoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  comandaId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  articuloId: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  cantidad: number;

  @ApiProperty({ example: 'Sin sal', required: false })
  @IsOptional()
  @IsString()
  nota?: string;
}