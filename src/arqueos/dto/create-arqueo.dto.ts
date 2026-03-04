import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArqueoDto {
  @ApiProperty({ example: 1, description: 'ID del cajero que realiza el arqueo' })
  @IsInt()
  cajeroId: number;

  // --- Conteo de billetes ---
  @ApiProperty({ example: 5, required: false })
  @IsOptional() @IsInt() @Min(0)
  billetes1000?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional() @IsInt() @Min(0)
  billetes2000?: number;

  @ApiProperty({ example: 8, required: false })
  @IsOptional() @IsInt() @Min(0)
  billetes5000?: number;

  @ApiProperty({ example: 4, required: false })
  @IsOptional() @IsInt() @Min(0)
  billetes10000?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional() @IsInt() @Min(0)
  billetes20000?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional() @IsInt() @Min(0)
  billetes50000?: number;

  // --- Totales declarados por método ---
  @ApiProperty({ example: 15000 })
  @IsNumber() @Min(0)
  totalEfectivo: number;

  @ApiProperty({ example: 8000, required: false })
  @IsOptional() @IsNumber() @Min(0)
  totalDebito?: number;

  @ApiProperty({ example: 5000, required: false })
  @IsOptional() @IsNumber() @Min(0)
  totalCredito?: number;

  @ApiProperty({ example: 3000, required: false })
  @IsOptional() @IsNumber() @Min(0)
  totalTransferencia?: number;

  @ApiProperty({ example: 2000, required: false })
  @IsOptional() @IsNumber() @Min(0)
  totalQr?: number;

  @ApiProperty({ example: 1500, required: false })
  @IsOptional() @IsNumber() @Min(0)
  totalPedidosYaCtaCte?: number;

  @ApiProperty({ example: 1000, required: false })
  @IsOptional() @IsNumber() @Min(0)
  totalPedidosYaEfectivo?: number;

  @ApiProperty({ example: 800, required: false })
  @IsOptional() @IsNumber() @Min(0)
  totalRappiCtaCte?: number;

  @ApiProperty({ example: 500, required: false })
  @IsOptional() @IsNumber() @Min(0)
  totalRappiEfectivo?: number;

  @ApiProperty({ example: 'Cierre normal del día', required: false })
  @IsOptional() @IsString()
  observaciones?: string;
}