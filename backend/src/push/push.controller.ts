import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PushService } from './push.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';

class SubscribeDto {
  endpoint: string;
  keysAuth: string;
  keysP256dh: string;
  userAgent?: string;
}

@ApiTags('Push')
@UseGuards(JwtAuthGuard)
@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @ApiOperation({ summary: 'Get the VAPID public key for subscription' })
  @Get('vapid-public-key')
  getPublicKey() {
    return { publicKey: this.pushService.getPublicKey() };
  }

  @ApiOperation({ summary: 'Register/update a push subscription' })
  @Post('subscribe')
  subscribe(@CurrentUser() user: AuthUser, @Body() dto: SubscribeDto) {
    if (!dto.endpoint || !dto.keysAuth || !dto.keysP256dh) {
      throw new BadRequestException('بيانات الاشتراك غير مكتملة');
    }
    return this.pushService.subscribe(user.sub, {
      endpoint: dto.endpoint,
      keysAuth: dto.keysAuth,
      keysP256dh: dto.keysP256dh,
      userAgent: dto.userAgent,
    });
  }

  @ApiOperation({ summary: 'Unsubscribe (remove) a push subscription' })
  @Delete('subscriptions/:id')
  unsubscribe(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.pushService.removeSubscription(user.sub, id);
  }
}
