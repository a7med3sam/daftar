import { Module } from '@nestjs/common';
import { ShopsModule } from './shops/shops.module';
import { BuyersModule } from './buyers/buyers.module';
import { PurchasesModule } from './purchases/purchases.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ShopsModule,
    BuyersModule,
    PurchasesModule,
    DashboardModule,
  ],
})
export class AppModule {}
