import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from './interfaces/auth-user.interface';
import { JWT_ACCESS_COOKIE, JWT_REFRESH_COOKIE } from './auth.constants';

function defaultCookieOptions() {
  const isProd =
    process.env.NODE_ENV === 'production' || process.env.IS_PROD === 'true';
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProd,
    path: '/',
  };
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.register(dto);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);
    return { user };
  }

  @ApiOperation({ summary: 'Login' })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.login(dto);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);
    return { user };
  }

  @ApiOperation({
    summary: 'Refresh access token using the refresh token cookie',
  })
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const oldRefresh = req.cookies?.[JWT_REFRESH_COOKIE] as string | undefined;
    const result = await this.authService.refresh(oldRefresh);
    this.setCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    return { user: result.user };
  }

  @ApiOperation({ summary: 'Logout and revoke the refresh token' })
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const oldRefresh = req.cookies?.[JWT_REFRESH_COOKIE] as string | undefined;
    await this.authService.logout(oldRefresh);
    res.clearCookie(JWT_ACCESS_COOKIE, {
      ...defaultCookieOptions(),
      maxAge: 0,
    });
    res.clearCookie(JWT_REFRESH_COOKIE, {
      ...defaultCookieOptions(),
      maxAge: 0,
    });
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @Get('me')
  async me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.sub);
  }

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    const opts = defaultCookieOptions();
    const accessTtl = Number(process.env.JWT_ACCESS_TTL ?? 900);
    const refreshTtl = Number(process.env.JWT_REFRESH_TTL ?? 2592000);
    res.cookie(JWT_ACCESS_COOKIE, accessToken, {
      ...opts,
      maxAge: accessTtl * 1000,
    });
    res.cookie(JWT_REFRESH_COOKIE, refreshToken, {
      ...opts,
      maxAge: refreshTtl * 1000,
    });
  }
}
