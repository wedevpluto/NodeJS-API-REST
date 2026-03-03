import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './database/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SectoresModule } from './sectores/sectores.module';
import { MesasModule } from './mesas/mesas.module';
import { ArticulosModule } from './articulos/articulos.module';
import { ComandasModule } from './comandas/comandas.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { ArqueosModule } from './arqueos/arqueos.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    PrismaModule,
    UsersModule,
    AuthModule,
    SectoresModule,
    MesasModule,
    ArticulosModule,
    ComandasModule,
    PedidosModule,
    ArqueosModule,
    EventsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}