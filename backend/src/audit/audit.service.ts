import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditPerson {
  id?: number;
  sub?: number;
  name: string;
}

export interface AuditEntry {
  user: AuditPerson | null;
  action: string;
  entityType: string;
  entityId?: number;
  entityName?: string;
  amount?: number;
  metadata?: Prisma.InputJsonObject;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(entry: AuditEntry) {
    let userName = 'النظام';
    let userId: number | null = null;
    if (entry.user) {
      userName = entry.user.name;
      userId = entry.user.id ?? entry.user.sub ?? null;
    }
    return this.prisma.auditLog.create({
      data: {
        userId,
        userName,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        entityName: entry.entityName,
        amount: entry.amount,
        metadata: entry.metadata,
      },
    });
  }

  async findAll(limit = 200) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
