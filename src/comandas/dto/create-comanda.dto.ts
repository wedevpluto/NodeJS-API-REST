import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min, IsOptional, IsArray, ValidateNested, IsString } from 'class-validator';

export class PedidoEnComandaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  articuloId: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  cantidad: number;

  @ApiProperty({ example: 'sin sal', required: false })
  @IsOptional()
  @IsString()
  nota?: string;
}

export class CreateComandaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  mesaId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  mozoId: number;

  @ApiProperty({ example: 4, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  comensales?: number;

  @ApiProperty({ type: [PedidoEnComandaDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PedidoEnComandaDto)
  pedidos?: PedidoEnComandaDto[];
}