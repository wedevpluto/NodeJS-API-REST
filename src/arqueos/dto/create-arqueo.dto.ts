import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArqueoDto {
  @ApiProperty({ example: 1, description: 'ID del cajero que realiza el arqueo' })
  @IsInt()
  cajeroId: number;

  // --- Conteo de billetes en efectivo ---
  @ApiProperty({ example: 5, required: false, description: 'Cantidad de billetes de $1000' })
  @IsOptional() @IsInt() @Min(0)
  billetes1000?: number;

  @ApiProperty({ example: 10, required: false, description: 'Cantidad de billetes de $2000' })
  @IsOptional() @IsInt() @Min(0)
  billetes2000?: number;

  @ApiProperty({ example: 8, required: false, description: 'Cantidad de billetes de $5000' })
  @IsOptional() @IsInt() @Min(0)
  billetes5000?: number;

  @ApiProperty({ example: 4, required: false, description: 'Cantidad de billetes de $10000' })
  @IsOptional() @IsInt() @Min(0)
  billetes10000?: number;

  @ApiProperty({ example: 2, required: false, description: 'Cantidad de billetes de $20000' })
  @IsOptional() @IsInt() @Min(0)
  billetes20000?: number;

  @ApiProperty({ example: 1, required: false, description: 'Cantidad de billetes de $50000' })
  @IsOptional() @IsInt() @Min(0)
  billetes50000?: number;

  // --- Totales por método de pago ---
  @ApiProperty({ example: 15000, description: 'Total cobrado en efectivo' })
  @IsNumber() @Min(0)
  totalEfectivo: number;

  @ApiProperty({ example: 8000, required: false, description: 'Total cobrado con débito' })
  @IsOptional() @IsNumber() @Min(0)
  totalDebito?: number;

  @ApiProperty({ example: 5000, required: false, description: 'Total cobrado con crédito' })
  @IsOptional() @IsNumber() @Min(0)
  totalCredito?: number;

  @ApiProperty({ example: 3000, required: false, description: 'Total cobrado por transferencia' })
  @IsOptional() @IsNumber() @Min(0)
  totalTransferencia?: number;

  @ApiProperty({ example: 2000, required: false, description: 'Total cobrado por QR' })
  @IsOptional() @IsNumber() @Min(0)
  totalQr?: number;

  @ApiProperty({ example: 1500, required: false, description: 'Total Pedidos Ya cuenta corriente' })
  @IsOptional() @IsNumber() @Min(0)
  totalPedidosYaCtaCte?: number;

  @ApiProperty({ example: 1000, required: false, description: 'Total Pedidos Ya efectivo' })
  @IsOptional() @IsNumber() @Min(0)
  totalPedidosYaEfectivo?: number;

  @ApiProperty({ example: 800, required: false, description: 'Total Rappi cuenta corriente' })
  @IsOptional() @IsNumber() @Min(0)
  totalRappiCtaCte?: number;

  @ApiProperty({ example: 500, required: false, description: 'Total Rappi efectivo' })
  @IsOptional() @IsNumber() @Min(0)
  totalRappiEfectivo?: number;

  // --- Cierre ---
  @ApiProperty({ example: 36800, description: 'Suma total de todos los métodos de pago' })
  @IsNumber() @Min(0)
  totalGeneral: number;

  @ApiProperty({ example: 500, required: false, description: 'Diferencia entre efectivo real y esperado (+ sobrante / - faltante)' })
  @IsOptional() @IsNumber()
  diferencia?: number;

  @ApiProperty({ example: 'Cierre normal del día', required: false })
  @IsOptional() @IsString()
  observaciones?: string;
}