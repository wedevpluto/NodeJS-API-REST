import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateSectorDto {
  @ApiProperty({ example: 'Salón principal' })
  @IsString()
  @MinLength(2)
  nombre: string;
}