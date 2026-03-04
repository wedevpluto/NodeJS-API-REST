import { Module } from '@nestjs/common';
import { ComandasService } from './comandas.service';
import { ComandasController } from './comandas.controller';
import { PrismaModule } from '../database/prisma.module';
import { EventsModule } from '../events/events.module';
import { TicketService } from './ticket.service';

@Module({
  imports: [PrismaModule, EventsModule],
  controllers: [ComandasController],
  providers: [ComandasService, TicketService],
  exports: [ComandasService],
})
export class ComandasModule {}