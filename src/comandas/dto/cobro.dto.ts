import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum MetodoPago {
  EFECTIVO = 'EFECTIVO',
  DEBITO = 'DEBITO',
  CREDITO = 'CREDITO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  QR = 'QR',
  PEDIDOS_YA_CTA_CTE = 'PEDIDOS_YA_CTA_CTE',
  PEDIDOS_YA_EFECTIVO = 'PEDIDOS_YA_EFECTIVO',
  RAPPI_CTA_CTE = 'RAPPI_CTA_CTE',
  RAPPI_EFECTIVO = 'RAPPI_EFECTIVO',
}

export class CobroDto {
  @ApiProperty({ enum: MetodoPago, example: MetodoPago.EFECTIVO, description: 'Método de pago utilizado' })
  @IsEnum(MetodoPago)
  metodoPago: MetodoPago;

  @ApiProperty({ example: 5000, description: 'Monto abonado por el cliente (para calcular vuelto)' })
  @IsNumber()
  @Min(0)
  montoAbonado: number;

  @ApiProperty({ example: 'Pago con QR Mercado Pago', required: false })
  @IsOptional()
  observaciones?: string;
}