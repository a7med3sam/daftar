import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateBuyerDto } from './dto/update-buyer.dto';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';

@Injectable()
export class BuyersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  async findAll() {
    return this.prisma.buyer.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const buyer = await this.prisma.buyer.findUnique({ where: { id } });
    if (!buyer) throw new NotFoundException(`المشتري رقم ${id} غير موجود`);
    return buyer;
  }

  async create(dto: CreateBuyerDto, user: AuthUser) {
    const buyer = await this.prisma.buyer.create({ data: dto });

    await this.audit.record({
      user,
      action: 'buyer.created',
      entityType: 'buyer',
      entityId: buyer.id,
      entityName: buyer.name,
    });

    await this.notifications.notifyFamily({
      actor: user,
      type: 'buyer.created',
      title: 'مشترٍ جديد',
      message: `${user.name} أضاف مشترياً باسم "${buyer.name}"`,
      entityType: 'buyer',
      entityId: buyer.id,
      entityName: buyer.name,
    });

    return buyer;
  }

  async update(id: number, dto: UpdateBuyerDto, user: AuthUser) {
    const existing = await this.findOne(id);
    const updated = await this.prisma.buyer.update({
      where: { id },
      data: dto,
    });

    await this.audit.record({
      user,
      action: 'buyer.updated',
      entityType: 'buyer',
      entityId: id,
      entityName: dto.name ?? existing.name,
    });

    await this.notifications.notifyFamily({
      actor: user,
      type: 'buyer.updated',
      title: 'تعديل مشترٍ',
      message: `${user.name} عدّل بيانات مشتري "${dto.name ?? existing.name}"`,
      entityType: 'buyer',
      entityId: id,
      entityName: dto.name ?? existing.name,
    });

    return updated;
  }

  async uploadImage(
    id: number,
    fileBuffer: Buffer,
  ): Promise<{ imageUrl: string }> {
    await this.findOne(id);
    const imageUrl = await this.cloudinary.uploadImage(
      fileBuffer,
      'daftar/buyers',
    );
    await this.prisma.buyer.update({ where: { id }, data: { imageUrl } });
    return { imageUrl };
  }

  async remove(id: number, user: AuthUser) {
    const existing = await this.findOne(id);
    const result = await this.prisma.buyer.delete({ where: { id } });

    await this.audit.record({
      user,
      action: 'buyer.deleted',
      entityType: 'buyer',
      entityId: id,
      entityName: existing.name,
    });

    await this.notifications.notifyFamily({
      actor: user,
      type: 'buyer.deleted',
      title: 'حذف مشترٍ',
      message: `${user.name} حذف مشتري "${existing.name}"`,
      entityType: 'buyer',
      entityId: id,
      entityName: existing.name,
    });

    return result;
  }
}
