import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiOkResponse({
    schema: {
      example: {
        totalPurchases: 100,
        totalSpent: 15000.5,
        totalPaid: 10000.0,
        totalUnpaid: 5000.5,
      },
    },
  })
  @Get()
  getStats() {
    return this.dashboardService.getStats();
  }
}
