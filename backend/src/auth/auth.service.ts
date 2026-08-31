import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, createHash } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { normalizeName } from '../common/utils/name.util';
import { AuthUser } from './interfaces/auth-user.interface';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function publicUser(user: {
  id: number;
  name: string;
  familyGroup: string;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    familyGroup: user.familyGroup,
    createdAt: user.createdAt,
  };
}

@Injectable()
export class AuthService {
  private readonly accessTtlSeconds: number;
  private readonly refreshTtlSeconds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    this.accessTtlSeconds = Number(process.env.JWT_ACCESS_TTL ?? 900);
    this.refreshTtlSeconds = Number(process.env.JWT_REFRESH_TTL ?? 2592000);
  }

  private async issueTokenPair(
    userId: number,
    name: string,
    familyGroup: string,
  ): Promise<TokenPair> {
    const payload: AuthUser = { sub: userId, name, familyGroup };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: this.accessTtlSeconds,
    });

    const refreshToken = randomBytes(48).toString('base64url');
    const tokenHash = hashRefreshToken(refreshToken);
    await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt: new Date(Date.now() + this.refreshTtlSeconds * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresInSeconds: this.accessTtlSeconds,
    };
  }

  async register(dto: RegisterDto) {
    const normalizedName = normalizeName(dto.name);

    const existing = await this.prisma.user.findFirst({
      where: { normalizedName },
    });
    if (existing) {
      throw new ConflictException('هذا الاسم مستخدم بالفعل');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const familyGroup = process.env.DEFAULT_FAMILY_GROUP ?? 'default';

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        normalizedName,
        passwordHash,
        familyGroup,
      },
    });

    const tokens = await this.issueTokenPair(
      user.id,
      user.name,
      user.familyGroup,
    );
    return { user: publicUser(user), tokens };
  }

  async login(dto: LoginDto) {
    const normalizedName = normalizeName(dto.name);
    const user = await this.prisma.user.findFirst({
      where: { normalizedName },
    });

    if (!user) {
      throw new UnauthorizedException('اسم المستخدم أو كلمة المرور غير صحيحة');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('اسم المستخدم أو كلمة المرور غير صحيحة');
    }

    const tokens = await this.issueTokenPair(
      user.id,
      user.name,
      user.familyGroup,
    );
    return { user: publicUser(user), tokens };
  }

  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) throw new UnauthorizedException('غير مصرح به');
    const tokenHash = hashRefreshToken(refreshToken);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.revokedAt) {
      throw new UnauthorizedException('انتهت صلاحية الجلسة');
    }
    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedException('انتهت صلاحية الجلسة');
    }

    // Rotate: revoke current and issue a new one
    const newToken = randomBytes(48).toString('base64url');
    await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { id: stored.id },
        data: {
          revokedAt: new Date(),
          replacedByTokenHash: hashRefreshToken(newToken),
        },
      }),
      this.prisma.refreshToken.create({
        data: {
          tokenHash: hashRefreshToken(newToken),
          userId: stored.userId,
          expiresAt: new Date(Date.now() + this.refreshTtlSeconds * 1000),
        },
      }),
    ]);

    const accessToken = await this.jwtService.signAsync(
      {
        sub: stored.user.id,
        name: stored.user.name,
        familyGroup: stored.user.familyGroup,
      },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: this.accessTtlSeconds,
      },
    );

    return {
      user: publicUser(stored.user),
      tokens: {
        accessToken,
        refreshToken: newToken,
        expiresInSeconds: this.accessTtlSeconds,
      },
    };
  }

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) return { success: true };
    const tokenHash = hashRefreshToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  }

  async me(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('غير مصرح به');
    return publicUser(user);
  }
}
