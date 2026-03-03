import { IsInt, IsOptional, IsString, Min, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdatePedidoItemDto {
  @ApiProperty({ example: 1, description: 'ID del pedido a modificar' })
  @IsInt()
  @Min(1)
  pedidoId: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  cantidad?: number;

  @ApiProperty({ example: 'Sin sal', required: false })
  @IsOptional()
  @IsString()
  nota?: string;
}

export class UpdateComandaDto {
  @ApiProperty({
    type: [UpdatePedidoItemDto],
    required: false,
    description: 'Lista de pedidos a modificar dentro de la comanda',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePedidoItemDto)
  pedidos?: UpdatePedidoItemDto[];
}