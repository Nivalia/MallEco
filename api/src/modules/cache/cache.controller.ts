import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('缓存模块')
@Controller('cache')
export class CacheController {
  @Get()
  @ApiOperation({ summary: '缓存模块根路径' })
  @ApiResponse({ status: 200, description: '缓存模块API信息' })
  async getCacheRoot() {
    return {
      success: true,
      message: '缓存模块API',
      data: {
        name: 'MallEco Cache API',
        version: '1.0.0',
        availableEndpoints: {
          optimization: '/api/cache/optimization',
          analysis: '/api/cache/analysis',
        },
      },
    };
  }
}
