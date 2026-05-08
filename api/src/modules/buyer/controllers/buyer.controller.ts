import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('买家模块')
@Controller('buyer')
export class BuyerController {
  @Get()
  getBuyerRoot() {
    return {
      success: true,
      message: '买家模块API',
      data: {
        name: 'MallEco Buyer API',
        version: '1.0.0',
        description: '电商生态系统买家端API',
        availableEndpoints: {
          pageData: '/api/buyer/other/pageData',
          goods: '/api/buyer/goods/goods',
          category: '/api/buyer/goods/category',
          member: '/api/buyer/passport/member',
          article: '/api/buyer/other/article',
          coupon: '/api/buyer/promotion/coupon',
        },
        documentation: '访问 /api-docs 查看完整的API文档',
      },
    };
  }
}
