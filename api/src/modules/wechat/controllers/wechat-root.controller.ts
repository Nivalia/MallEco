import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('微信模块')
@Controller('wechat')
export class WechatRootController {
  @ApiOperation({ summary: '微信模块根路径' })
  @ApiResponse({ status: 200, description: '微信模块API信息' })
  @Get()
  async getWechatRoot() {
    return {
      success: true,
      message: '微信模块API',
      data: {
        name: 'MallEco Wechat API',
        version: '1.0.0',
        availableEndpoints: {
          overview: '/api/admin/wechat/overview (GET)',
          config: '/api/admin/wechat/config (GET)',
          updateConfig: '/api/admin/wechat/config (POST)',
          stats: '/api/admin/wechat/stats (GET)',
          coupon: '/api/wechat/coupon (GET)',
          fans: '/api/wechat/fans (GET)',
          h5: '/api/wechat/h5 (GET)',
          material: '/api/wechat/material (GET)',
          menu: '/api/wechat/menu (GET)',
          oauth: '/api/wechat/oauth (GET)',
          subscribe: '/api/wechat/subscribe (GET)',
          template: '/api/wechat/template (GET)',
        },
      },
    };
  }
}
