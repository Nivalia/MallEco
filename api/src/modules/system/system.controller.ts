import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('系统模块')
@Controller('system')
export class SystemController {
  @Get()
  @ApiOperation({ summary: '系统模块根路径' })
  @ApiResponse({ status: 200, description: '系统模块API信息' })
  async getSystemRoot() {
    return {
      success: true,
      message: '系统模块API',
      data: {
        name: 'MallEco System API',
        version: '1.0.0',
        availableEndpoints: {
          config: '/api/system/config',
          logs: '/api/system/logs',
          monitor: '/api/system/monitor',
          backup: '/api/system/backup',
          version: '/api/system/version',
          diagnosis: '/api/system/diagnosis',
        },
      },
    };
  }
}
