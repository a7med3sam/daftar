import { Module } from '@nestjs/common';
import { ShopsModule } from './shops/shops.module';
import { BuyersModule } from './buyers/buyers.module';
import { PurchasesModule } from './purchases/purchases.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PushModule } from './push/push.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ShopsModule,
    BuyersModule,
    PurchasesModule,
    DashboardModule,
    AuditModule,
    NotificationsModule,
    PushModule,
  ],
})
export class AppModule {}
