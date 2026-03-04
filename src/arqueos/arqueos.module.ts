import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma.module';
import { ArqueosService } from './application/arqueos.service';
import { PrismaArqueoRepository } from './infrastructure/prisma-arqueo.repository';
import { ARQUEO_REPOSITORY } from './domain/arqueo.repository';

@Module({
  imports: [PrismaModule], // 👈 ESTO FALTABA
  providers: [
    ArqueosService,
    {
      provide: ARQUEO_REPOSITORY,
      useClass: PrismaArqueoRepository,
    },
  ],
  exports: [ArqueosService],
})
export class ArqueosModule {}