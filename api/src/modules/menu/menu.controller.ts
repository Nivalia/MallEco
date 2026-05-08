import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TransformInterceptor } from '../../shared/interceptors/transform.interceptor';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@ApiTags('菜单管理')
@Controller('menu')
@UseInterceptors(TransformInterceptor)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('admin')
  @ApiOperation({ summary: '获取管理端菜单树' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  getAdminMenuTree() {
    return this.menuService.getAdminMenuTree();
  }

  @Get('seller')
  @ApiOperation({ summary: '获取卖家端菜单树' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN, Role.SUPER_ADMIN)
  getSellerMenuTree() {
    return this.menuService.getSellerMenuTree();
  }

  @Get('wechat')
  @ApiOperation({ summary: '获取微信菜单配置' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  getWechatMenu() {
    return this.menuService.getWechatMenu();
  }

  @Get('user')
  @ApiOperation({ summary: '获取用户权限菜单' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'userType', enum: ['admin', 'seller'], description: '用户类型' })
  @ApiQuery({ name: 'permissions', type: [String], required: false, description: '用户权限列表' })
  // 暂时移除 JwtAuthGuard，让前端可以直接访问
  // @UseGuards(JwtAuthGuard)
  getUserMenuTree(
    @Query('userType') userType: 'admin' | 'seller',
    @Query('permissions') permissions?: string[],
  ) {
    const permissionList = permissions
      ? Array.isArray(permissions)
        ? permissions
        : [permissions]
      : [];
    return this.menuService.getUserMenuTree(userType, permissionList);
  }

  @Get()
  @ApiOperation({ summary: '菜单模块根路径' })
  @ApiResponse({ status: 200, description: '菜单模块API信息' })
  async getMenuRoot() {
    return {
      success: true,
      message: '菜单模块API',
      data: {
        name: 'MallEco Menu API',
        version: '1.0.0',
        availableEndpoints: {
          admin: '/api/menu/admin (GET)',
          seller: '/api/menu/seller (GET)',
          wechat: '/api/menu/wechat (GET)',
          user: '/api/menu/user (GET)',
        },
      },
    };
  }
}
