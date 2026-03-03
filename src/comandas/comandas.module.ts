import { Module } from '@nestjs/common';
import { ComandasService } from './comandas.service';
import { ComandasController } from './comandas.controller';
import { PrismaModule } from '../database/prisma.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [PrismaModule, EventsModule],
  controllers: [ComandasController],
  providers: [ComandasService],
  exports: [ComandasService],
})
export class ComandasModule {}