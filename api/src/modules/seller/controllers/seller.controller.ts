import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('卖家模块')
@Controller('seller')
export class SellerController {
  @Get()
  getSellerRoot() {
    return {
      success: true,
      message: '卖家模块API',
      data: {
        name: 'MallEco Seller API',
        version: '1.0.0',
        description: '电商生态系统卖家端API',
        availableEndpoints: {
          dashboard: '/api/seller/statistics/dashboard',
          goods: '/api/seller/goods/goods',
          category: '/api/seller/goods/category',
          specification: '/api/seller/goods/specification',
          order: '/api/seller/order/order',
          aftersale: '/api/seller/order/aftersale',
          promotion: '/api/seller/promotion/promotion',
          store: '/api/seller/settings/store',
        },
        documentation: '访问 /api-docs 查看完整的API文档',
      },
    };
  }
}
