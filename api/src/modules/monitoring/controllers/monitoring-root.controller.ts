import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('监控模块')
@Controller('monitoring')
export class MonitoringRootController {
  @ApiOperation({ summary: '监控模块根路径' })
  @ApiResponse({ status: 200, description: '监控模块API信息' })
  @Get()
  async getMonitoringRoot() {
    return {
      success: true,
      message: '监控模块API',
      data: {
        name: 'MallEco Monitoring API',
        version: '1.0.0',
        availableEndpoints: {
          health: '/api/health (GET)',
          metrics: '/api/metrics (GET)',
          info: '/api/info (GET)',
          status: '/api/status (GET)',
        },
      },
    };
  }
}
