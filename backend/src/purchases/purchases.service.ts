import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}

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
    if (!purchase)
      throw new NotFoundException(`الشراء رقم ${id} غير موجود`);
    return this.addRemainingAmount(purchase);
  }

  private addRemainingAmount(purchase: any) {
    const total = Number(purchase.totalAmount);
    const paid = Number(purchase.paidAmount);
    return { ...purchase, remainingAmount: total - paid };
  }

  async create(dto: CreatePurchaseDto) {
    const total = dto.totalAmount;
    const paid = dto.paidAmount ?? 0;

    if (paid > total) {
      throw new BadRequestException(
        'المبلغ المدفوع لا يمكن أن يتجاوز الإجمالي',
      );
    }

    const paymentStatus = this.computeStatus(total, paid);

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
        items: dto.items?.length ? {
          create: dto.items.map(i => ({ name: i.name, price: i.price }))
        } : undefined,
      },
      include: {
        shop: true,
        buyer: true,
        paidBy: true,
        images: true,
        items: true,
      },
    });
    return this.addRemainingAmount(purchase);
  }

  async update(id: number, dto: UpdatePurchaseDto) {
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
        paidById: paid > 0 ? dto.paidById ?? existing.paidById : null,
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
            create: dto.items.map(i => ({ name: i.name, price: i.price }))
          }
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
    return this.addRemainingAmount(purchase);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.purchase.delete({ where: { id } });
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
