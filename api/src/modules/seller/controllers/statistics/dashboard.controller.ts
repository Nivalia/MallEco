import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardQueryDto } from '../../../statistics/dto/dashboard-query.dto';
import { DashboardService } from '../../../statistics/services/dashboard.service';

@ApiTags('卖家-仪表盘')
@Controller('seller/statistics')
export class SellerDashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard')
  @ApiOperation({ summary: '获取卖家仪表盘数据' })
  @ApiResponse({ status: 200, description: '获取卖家仪表盘数据成功' })
  getDashboardData(@Query() queryDto: DashboardQueryDto) {
    return this.dashboardService.getDashboardData(queryDto);
  }
}
