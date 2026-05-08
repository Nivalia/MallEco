import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('即时通讯模块')
@Controller('im')
export class ImRootController {
  @ApiOperation({ summary: '即时通讯模块根路径' })
  @ApiResponse({ status: 200, description: '即时通讯模块API信息' })
  @Get()
  async getImRoot() {
    return {
      success: true,
      message: '即时通讯模块API',
      data: {
        name: 'MallEco IM API',
        version: '1.0.0',
        availableEndpoints: {
          imUrl: '/api/common/common/IM (GET)',
        },
      },
    };
  }
}
