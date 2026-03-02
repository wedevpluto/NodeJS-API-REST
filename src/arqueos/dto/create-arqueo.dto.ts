import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateArqueoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  cajeroId: number;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  @Min(0)
  totalEfectivo: number;

  @ApiProperty({ example: 8000 })
  @IsNumber()
  @Min(0)
  totalTarjeta: number;

  @ApiProperty({ example: 'Cierre normal del día', required: false })
  @IsOptional()
  @IsString()
  observaciones?: string;
}