import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, Min } from 'class-validator';
import { CategoriaArticulo } from '@prisma/client';

export class CreateArticuloDto {
  @ApiProperty({ example: 'Milanesa con papas' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 1500.00 })
  @IsNumber()
  @Min(0)
  precio: number;

  @ApiProperty({ enum: CategoriaArticulo })
  @IsEnum(CategoriaArticulo)
  categoria: CategoriaArticulo;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  disponible?: boolean;
}
