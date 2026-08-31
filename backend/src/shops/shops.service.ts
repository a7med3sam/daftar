import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';

@Injectable()
export class ShopsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

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

  async create(dto: CreateShopDto, user: AuthUser) {
    const shop = await this.prisma.shop.create({ data: dto });

    await this.audit.record({
      user,
      action: 'shop.created',
      entityType: 'shop',
      entityId: shop.id,
      entityName: shop.name,
    });

    await this.notifications.notifyFamily({
      actor: user,
      type: 'shop.created',
      title: 'محل جديد',
      message: `${user.name} أضاف محل "${shop.name}"`,
      entityType: 'shop',
      entityId: shop.id,
      entityName: shop.name,
      push: {
        title: 'محل جديد',
        body: `${user.name} أضاف محل "${shop.name}"`,
        url: `/shops/${shop.id}`,
      },
    });

    return shop;
  }

  async update(id: number, dto: UpdateShopDto, user: AuthUser) {
    const existing = await this.findOne(id);
    const updated = await this.prisma.shop.update({ where: { id }, data: dto });

    await this.audit.record({
      user,
      action: 'shop.updated',
      entityType: 'shop',
      entityId: id,
      entityName: dto.name ?? existing.name,
    });

    await this.notifications.notifyFamily({
      actor: user,
      type: 'shop.updated',
      title: 'تعديل محل',
      message: `${user.name} عدّل البيانات في محل "${dto.name ?? existing.name}"`,
      entityType: 'shop',
      entityId: id,
      entityName: dto.name ?? existing.name,
    });

    return updated;
  }

  async remove(id: number, user: AuthUser) {
    const existing = await this.findOne(id);
    const result = await this.prisma.shop.delete({ where: { id } });

    await this.audit.record({
      user,
      action: 'shop.deleted',
      entityType: 'shop',
      entityId: id,
      entityName: existing.name,
    });

    await this.notifications.notifyFamily({
      actor: user,
      type: 'shop.deleted',
      title: 'حذف محل',
      message: `${user.name} حذف محل "${existing.name}"`,
      entityType: 'shop',
      entityId: id,
      entityName: existing.name,
    });

    return result;
  }
}
