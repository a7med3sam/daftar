import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

@Injectable()
export class ShopsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.shop.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
      include: {
        purchases: {
          include: {
            buyer: true,
            paidBy: true,
            images: true,
          },
          orderBy: { purchaseDate: 'desc' },
        },
      },
    });
    if (!shop) throw new NotFoundException(`المحل رقم ${id} غير موجود`);
    return shop;
  }

  async getShopStats(id: number) {
    const shop = await this.findOne(id);
    const totalAmount = shop.purchases.reduce(
      (sum, p) => sum + Number(p.totalAmount),
      0,
    );
    const paidAmount = shop.purchases.reduce(
      (sum, p) => sum + Number(p.paidAmount),
      0,
    );
    return {
      ...shop,
      totalAmount,
      paidAmount,
      remainingAmount: totalAmount - paidAmount,
    };
  }

  async create(dto: CreateShopDto) {
    return this.prisma.shop.create({ data: dto });
  }

  async update(id: number, dto: UpdateShopDto) {
    await this.findOne(id);
    return this.prisma.shop.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.shop.delete({ where: { id } });
  }
}
