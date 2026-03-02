import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsEnum, IsOptional, Min } from 'class-validator';
import { EstadoMesa } from '@prisma/client';

export class CreateMesaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  numero: number;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  capacidad: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  sectorId: number;

  @ApiProperty({ enum: EstadoMesa, default: EstadoMesa.LIBRE })
  @IsOptional()
  @IsEnum(EstadoMesa)
  estado?: EstadoMesa;
}