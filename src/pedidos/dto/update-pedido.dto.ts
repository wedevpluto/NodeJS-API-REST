import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePedidoDto {
  @ApiProperty({ example: 3, required: false, description: 'Nueva cantidad del ítem' })
  @IsOptional()
  @IsInt()
  @Min(1)
  cantidad?: number;

  @ApiProperty({ example: 'Sin cebolla', required: false, description: 'Nota o aclaración del pedido' })
  @IsOptional()
  @IsString()
  nota?: string;
}