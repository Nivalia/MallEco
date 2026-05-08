import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MenuService } from '../../../menu/menu.service';

@ApiTags('管理端-权限管理')
@Controller('manager/permission')
export class ManagerPermissionController {
  constructor(private readonly menuService: MenuService) {}

  @Get('menu/memberMenu')
  @ApiOperation({ summary: '获取管理员权限菜单' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMemberMenu() {
    try {
      // 获取管理员菜单树
      const menuTree = await this.menuService.getAdminMenuTree();

      console.log('📋 获取管理员菜单树，菜单数量:', menuTree?.length || 0);
      if (!menuTree || menuTree.length === 0) {
        console.warn('⚠️ 菜单树为空，可能菜单服务未正确初始化');
      }

      // 返回格式匹配前端期望：{ success: true, result: [...] }
      return {
        success: true,
        result: menuTree || [],
      };
    } catch (error: any) {
      console.error('❌ 获取权限菜单失败:', error);
      return {
        success: false,
        message: error.message || '获取权限菜单失败，请稍后重试',
        result: [],
      };
    }
  }
}
