import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiOkResponse({ schema: { example: { totalPurchases: 100, totalSpent: 15000.50, totalPaid: 10000.00, totalUnpaid: 5000.50 } } })
  @Get()
  getStats() {
    return this.dashboardService.getStats();
  }
}
