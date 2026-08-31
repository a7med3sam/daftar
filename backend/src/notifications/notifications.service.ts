import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PushService, PushPayload } from '../push/push.service';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';

export interface CreateNotificationInput {
  actor: AuthUser;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: number;
  entityName?: string;
  push?: PushPayload;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pushService: PushService,
  ) {}

  /**
   * Creates an in-app notification for every other member of the actor's
   * family, then best-effort delivers a web push to each recipient.
   * Push delivery failures never throw.
   */
  async notifyFamily(input: CreateNotificationInput) {
    const recipients = await this.prisma.user.findMany({
      where: {
        familyGroup: input.actor.familyGroup,
        id: { not: input.actor.sub },
      },
      select: { id: true },
    });

    if (recipients.length === 0) return;

    const push = input.push;

    const records = await Promise.all(
      recipients.map((r) =>
        this.prisma.notification.create({
          data: {
            actorId: input.actor.sub,
            actorName: input.actor.name,
            recipientId: r.id,
            type: input.type,
            title: input.title,
            message: input.message,
            entityType: input.entityType,
            entityId: input.entityId,
            entityName: input.entityName,
          },
        }),
      ),
    );

    if (push) {
      await Promise.allSettled(
        recipients.map((r) => this.pushService.deliverToUser(r.id, push)),
      );
    }

    return records;
  }

  async list(userId: number, limit = 50) {
    return this.prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async unreadCount(userId: number) {
    const count = await this.prisma.notification.count({
      where: { recipientId: userId, readAt: null },
    });
    return { count };
  }

  async markRead(id: number, userId: number) {
    const existing = await this.prisma.notification.findFirst({
      where: { id, recipientId: userId },
    });
    if (!existing) return null;
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: existing.readAt ?? new Date() },
    });
  }

  async markAllRead(userId: number) {
    const result = await this.prisma.notification.updateMany({
      where: { recipientId: userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { count: result.count };
  }
}
