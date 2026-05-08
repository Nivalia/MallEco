import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('统计模块')
@Controller('statistics')
export class StatisticsController {
  @Get()
  @ApiOperation({ summary: '统计模块根路径' })
  @ApiResponse({ status: 200, description: '统计模块API信息' })
  async getStatisticsRoot() {
    return {
      success: true,
      message: '统计模块API',
      data: {
        name: 'MallEco Statistics API',
        version: '1.0.0',
        availableEndpoints: {
          sales: '/api/statistics/sales',
          users: '/api/statistics/users',
          orders: '/api/statistics/orders',
          financial: '/api/statistics/financial',
          dashboard: '/api/statistics/dashboard',
        },
      },
    };
  }
}
