import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('管理模块')
@Controller('manager')
export class ManagerController {
  @Get()
  getManagerRoot() {
    return {
      success: true,
      message: '管理模块API',
      data: {
        name: 'MallEco Manager API',
        version: '1.0.0',
        description: '电商生态系统管理端API',
        availableEndpoints: {
          dashboard: '/api/manager/statistics/dashboard',
          goods: '/api/manager/goods/goods',
          brand: '/api/manager/goods/brand',
          category: '/api/manager/goods/category',
          member: '/api/manager/member/member',
          grade: '/api/manager/member/grade',
          order: '/api/manager/order/order',
          promotion: '/api/manager/promotion/promotion',
          permission: '/api/manager/permission/permission',
          system: '/api/manager/setting/system',
        },
        documentation: '访问 /api-docs 查看完整的API文档',
      },
    };
  }
}
