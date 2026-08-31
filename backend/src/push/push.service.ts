import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import * as webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly vapidPublicKey: string = process.env.VAPID_PUBLIC_KEY ?? '';
  private readonly vapidPrivateKey: string =
    process.env.VAPID_PRIVATE_KEY ?? '';
  private readonly vapidSubject: string =
    process.env.VAPID_SUBJECT ?? 'mailto:daftar@example.com';

  constructor(private readonly prisma: PrismaService) {}

  async subscribe(
    userId: number,
    data: {
      endpoint: string;
      keysAuth: string;
      keysP256dh: string;
      userAgent?: string;
    },
  ) {
    const existing = await this.prisma.pushSubscription.findUnique({
      where: { endpoint: data.endpoint },
    });
    if (existing) {
      return this.prisma.pushSubscription.update({
        where: { id: existing.id },
        data: {
          userId,
          keysAuth: data.keysAuth,
          keysP256dh: data.keysP256dh,
          userAgent: data.userAgent,
        },
      });
    }
    return this.prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: data.endpoint,
        keysAuth: data.keysAuth,
        keysP256dh: data.keysP256dh,
        userAgent: data.userAgent,
      },
    });
  }

  /**
   * Sends a push notification to every subscription belonging to the user.
   * Failures are caught and never thrown — a delivery failure must never
   * break the underlying business operation.
   */
  async deliverToUser(userId: number, payload: PushPayload): Promise<void> {
    const subs = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });
    if (subs.length === 0) return;

    if (!this.vapidPublicKey || !this.vapidPrivateKey) {
      this.logger.warn('VAPID keys not configured — skipping push delivery');
      return;
    }

    webpush.setVapidDetails(
      this.vapidSubject,
      this.vapidPublicKey,
      this.vapidPrivateKey,
    );

    const body = JSON.stringify(payload);

    await Promise.allSettled(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { auth: sub.keysAuth, p256dh: sub.keysP256dh },
            },
            body,
          );
        } catch (err) {
          // Detect permanent failure (gone / not found) and clean up
          const code = (err as { statusCode?: number })?.statusCode;
          if (code === 410 || code === 404) {
            await this.prisma.pushSubscription
              .delete({ where: { id: sub.id } })
              .catch(() => {});
          }
          const message = err instanceof Error ? err.message : String(err);
          this.logger.warn(
            `Push delivery failed for sub ${sub.id}: ${message}`,
          );
        }
      }),
    );
  }

  async removeSubscription(userId: number, id: number) {
    const existing = await this.prisma.pushSubscription.findUnique({
      where: { id },
    });
    if (!existing) return { success: true };
    if (existing.userId !== userId) {
      throw new ForbiddenException('غير مصرح به');
    }
    await this.prisma.pushSubscription.delete({ where: { id } });
    return { success: true };
  }

  getPublicKey(): string {
    return this.vapidPublicKey;
  }
}
