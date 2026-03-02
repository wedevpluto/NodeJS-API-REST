import { Module } from '@nestjs/common';
import { ArqueosService } from './arqueos.service';
import { ArqueosController } from './arqueos.controller';
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ArqueosController],
  providers: [ArqueosService],
})
export class ArqueosModule {}