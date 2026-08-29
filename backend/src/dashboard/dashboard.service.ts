import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const purchases = await this.prisma.purchase.findMany({
      include: { shop: true, buyer: true, images: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const allPurchases = await this.prisma.purchase.findMany();

    const totalPurchases = allPurchases.length;
    const totalAmount = allPurchases.reduce(
      (sum, p) => sum + Number(p.totalAmount),
      0,
    );
    const totalPaid = allPurchases.reduce(
      (sum, p) => sum + Number(p.paidAmount),
      0,
    );
    const totalRemaining = totalAmount - totalPaid;

    return {
      totalPurchases,
      totalAmount,
      totalPaid,
      totalRemaining,
      recentPurchases: purchases.map((p) => ({
        ...p,
        remainingAmount: Number(p.totalAmount) - Number(p.paidAmount),
      })),
    };
  }
}
