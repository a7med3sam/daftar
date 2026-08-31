import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import type { AuthUser } from '../../auth/interfaces/auth-user.interface';
import { JWT_ACCESS_COOKIE } from '../../auth/auth.constants';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('غير مصرح به');
    }
    try {
      const payload = await this.jwtService.verifyAsync<AuthUser>(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      request.user = {
        sub: payload.sub,
        name: payload.name,
        familyGroup: payload.familyGroup,
      };
    } catch {
      throw new UnauthorizedException('انتهت صلاحية الجلسة');
    }
    return true;
  }

  private extractToken(request: Request): string | undefined {
    const accessCookie = request.cookies?.[JWT_ACCESS_COOKIE] as
      string | undefined;
    if (accessCookie) return accessCookie;
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
    return undefined;
  }
}
