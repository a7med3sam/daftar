import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { PaymentStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';

@Injectable()
export class PurchasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Determines payment status based on amounts
   */
  private computeStatus(
    totalAmount: number,
    paidAmount: number,
  ): PaymentStatus {
    if (paidAmount <= 0) return PaymentStatus.UNPAID;
    if (paidAmount >= totalAmount) return PaymentStatus.PAID;
    return PaymentStatus.PARTIALLY_PAID;
  }

  async findAll() {
    const purchases = await this.prisma.purchase.findMany({
      include: {
        shop: true,
        buyer: true,
        paidBy: true,
        images: true,
        items: true,
      },
      orderBy: { purchaseDate: 'desc' },
    });
    return purchases.map((p) => this.addRemainingAmount(p));
  }

  async findOne(id: number) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: {
        shop: true,
        buyer: true,
        paidBy: true,
        images: true,
        items: true,
      },
    });
    if (!purchase) throw new NotFoundException(`الشراء رقم ${id} غير موجود`);
    return this.addRemainingAmount(purchase);
  }

  private addRemainingAmount(purchase: any) {
    const total = Number(purchase.totalAmount);
    const paid = Number(purchase.paidAmount);
    return { ...purchase, remainingAmount: total - paid };
  }

  async create(dto: CreatePurchaseDto, user: AuthUser) {
    const total = dto.totalAmount;
    const paid = dto.paidAmount ?? 0;

    if (paid > total) {
      throw new BadRequestException(
        'المبلغ المدفوع لا يمكن أن يتجاوز الإجمالي',
      );
    }

    const paymentStatus = this.computeStatus(total, paid);

    const shop = await this.prisma.shop
      .findUnique({ where: { id: dto.shopId } })
      .catch(() => null);
    const buyer = await this.prisma.buyer
      .findUnique({ where: { id: dto.buyerId } })
      .catch(() => null);

    const purchase = await this.prisma.purchase.create({
      data: {
        shopId: dto.shopId,
        buyerId: dto.buyerId,
        purchaseDate: new Date(dto.purchaseDate),
        totalAmount: total,
        paidAmount: paid,
        paymentStatus,
        paidById: paid > 0 ? dto.paidById : null,
        paidAt: paid > 0 && dto.paidAt ? new Date(dto.paidAt) : null,
        description: dto.description,
        items: dto.items?.length
          ? {
              create: dto.items.map((i) => ({ name: i.name, price: i.price })),
            }
          : undefined,
      },
      include: {
        shop: true,
        buyer: true,
        paidBy: true,
        images: true,
        items: true,
      },
    });

    const shopName = purchase.shop?.name ?? shop?.name ?? `محل #${dto.shopId}`;
    const buyerName = purchase.buyer?.name ?? buyer?.name ?? '';

    await this.audit.record({
      user,
      action: 'purchase.created',
      entityType: 'purchase',
      entityId: purchase.id,
      entityName: shopName,
      amount: total,
      metadata: { buyerName, paidAmount: paid },
    });

    if (paid > 0) {
      await this.recordPayment(
        user,
        purchase.id,
        shopName,
        paid,
        purchase.paidBy?.name,
      );
    } else {
      await this.notifications.notifyFamily({
        actor: user,
        type: 'purchase.created',
        title: 'فاتورة جديدة',
        message: `${user.name} أضاف فاتورة جديدة بمبلغ ${total} EGP من ${shopName}`,
        entityType: 'purchase',
        entityId: purchase.id,
        entityName: shopName,
        push: {
          title: 'فاتورة جديدة',
          body: `${user.name} أضاف فاتورة جديدة بمبلغ ${total} EGP من ${shopName}`,
          url: `/purchases/${purchase.id}`,
        },
      });
    }

    return this.addRemainingAmount(purchase);
  }

  private async recordPayment(
    user: AuthUser,
    purchaseId: number,
    shopName: string,
    amount: number,
    paidByName?: string,
  ) {
    await this.audit.record({
      user,
      action: 'purchase.payment',
      entityType: 'purchase',
      entityId: purchaseId,
      entityName: shopName,
      amount,
      metadata: { paidByName },
    });

    await this.notifications.notifyFamily({
      actor: user,
      type: 'purchase.payment',
      title: 'دفعة مسجلة',
      message: `${user.name} سجّل دفعة بمبلغ ${amount} EGP من ${shopName}`,
      entityType: 'purchase',
      entityId: purchaseId,
      entityName: shopName,
      push: {
        title: 'دفعة مسجلة',
        body: `${user.name} سجّل دفعة بمبلغ ${amount} EGP من ${shopName}`,
        url: `/purchases/${purchaseId}`,
      },
    });
  }

  async update(id: number, dto: UpdatePurchaseDto, user: AuthUser) {
    const existing = await this.findOne(id);

    const total =
      dto.totalAmount !== undefined
        ? dto.totalAmount
        : Number(existing.totalAmount);
    const paid =
      dto.paidAmount !== undefined
        ? dto.paidAmount
        : Number(existing.paidAmount);

    if (paid > total) {
      throw new BadRequestException(
        'المبلغ المدفوع لا يمكن أن يتجاوز الإجمالي',
      );
    }

    const paymentStatus = this.computeStatus(total, paid);

    const purchase = await this.prisma.purchase.update({
      where: { id },
      data: {
        ...(dto.shopId && { shopId: dto.shopId }),
        ...(dto.buyerId && { buyerId: dto.buyerId }),
        ...(dto.purchaseDate && {
          purchaseDate: new Date(dto.purchaseDate),
        }),
        totalAmount: total,
        paidAmount: paid,
        paymentStatus,
        paidById: paid > 0 ? (dto.paidById ?? existing.paidById) : null,
        paidAt:
          paid > 0 && dto.paidAt
            ? new Date(dto.paidAt)
            : paid > 0
              ? existing.paidAt
              : null,
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.items && {
          items: {
            deleteMany: {},
            create: dto.items.map((i) => ({ name: i.name, price: i.price })),
          },
        }),
      },
      include: {
        shop: true,
        buyer: true,
        paidBy: true,
        images: true,
        items: true,
      },
    });

    const shopName =
      purchase.shop?.name ?? existing.shop?.name ?? `محل #${purchase.shopId}`;

    // Detect whether a payment was recorded (paid amount increased)
    const prevPaid = Number(existing.paidAmount);
    const newPaid = Number(purchase.paidAmount);
    const paymentDelta = newPaid - prevPaid;
    const isPayment = paymentDelta > 0;

    await this.audit.record({
      user,
      action: isPayment ? 'purchase.payment' : 'purchase.updated',
      entityType: 'purchase',
      entityId: purchase.id,
      entityName: shopName,
      amount: isPayment ? paymentDelta : total,
      metadata: { paidAmount: newPaid },
    });

    if (isPayment) {
      await this.notifications.notifyFamily({
        actor: user,
        type: 'purchase.payment',
        title: 'دفعة مسجلة',
        message: `${user.name} سجّل دفعة بمبلغ ${paymentDelta} EGP من ${shopName}`,
        entityType: 'purchase',
        entityId: purchase.id,
        entityName: shopName,
        push: {
          title: 'دفعة مسجلة',
          body: `${user.name} سجّل دفعة بمبلغ ${paymentDelta} EGP من ${shopName}`,
          url: `/purchases/${purchase.id}`,
        },
      });
    }

    return this.addRemainingAmount(purchase);
  }

  async remove(id: number, user: AuthUser) {
    const existing = await this.findOne(id);
    const result = await this.prisma.purchase.delete({ where: { id } });

    await this.audit.record({
      user,
      action: 'purchase.deleted',
      entityType: 'purchase',
      entityId: id,
      entityName: existing.shop?.name ?? `محل #${existing.shopId}`,
      amount: Number(existing.totalAmount),
    });

    await this.notifications.notifyFamily({
      actor: user,
      type: 'purchase.deleted',
      title: 'حذف فاتورة',
      message: `${user.name} حذف فاتورة بمبلغ ${existing.totalAmount} EGP`,
      entityType: 'purchase',
      entityId: id,
      entityName: existing.shop?.name ?? '',
      push: {
        title: 'حذف فاتورة',
        body: `${user.name} حذف فاتورة بمبلغ ${existing.totalAmount} EGP`,
        url: '/',
      },
    });

    return result;
  }

  async addImageUrl(purchaseId: number, imageUrl: string, isReceipt = false) {
    await this.findOne(purchaseId);
    return this.prisma.purchaseImage.create({
      data: { purchaseId, imageUrl, isReceipt: Boolean(isReceipt) },
    });
  }

  async removeImage(imageId: number) {
    const image = await this.prisma.purchaseImage.findUnique({
      where: { id: imageId },
    });
    if (!image) throw new NotFoundException(`الصورة رقم ${imageId} غير موجودة`);
    return this.prisma.purchaseImage.delete({ where: { id: imageId } });
  }
}
