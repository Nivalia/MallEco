import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('权限管理模块')
@Controller('rbac')
export class RbacController {
  @Get()
  getRbacRoot() {
    return {
      success: true,
      message: '权限管理模块API',
      data: {
        name: 'MallEco RBAC API',
        version: '1.0.0',
        description: '电商生态系统权限管理API',
        availableEndpoints: {
          users: '/api/rbac/users',
          roles: '/api/rbac/roles',
          permissions: '/api/rbac/permissions',
          menus: '/api/rbac/menus',
          departments: '/api/rbac/departments',
        },
        documentation: '访问 /api-docs 查看完整的API文档',
      },
    };
  }
}
