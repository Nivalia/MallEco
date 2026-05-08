import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('通用模块')
@Controller('common')
export class CommonRootController {
  @ApiOperation({ summary: '通用模块根路径' })
  @ApiResponse({ status: 200, description: '通用模块API信息' })
  @Get()
  async getCommonRoot() {
    return {
      success: true,
      message: '通用模块API',
      data: {
        name: 'MallEco Common API',
        version: '1.0.0',
        availableEndpoints: {
          region: '/api/common/common/region (GET)',
          IM: '/api/common/common/IM (GET)',
          site: '/api/common/common/site (GET)',
          sms: '/api/common/common/sms/:verificationEnums/:mobile (GET)',
          slider: '/api/common/common/slider/:verificationEnums (GET)',
          upload: '/api/common/upload (POST)',
        },
      },
    };
  }
}
