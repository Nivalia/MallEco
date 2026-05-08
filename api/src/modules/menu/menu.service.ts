import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { adminMenus, sellerMenus } from './data/menu-data';
import { MenuItem, MenuTree, WechatMenu } from './types/menu.types';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class MenuService implements OnModuleInit {
  private menuCache = new Map<string, MenuTree[]>();

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeMenus();
  }

  /**
   * 统一初始化所有菜单
   */
  async initializeMenus(): Promise<void> {
    console.log('🚀 开始初始化菜单系统...');

    try {
      // 检查菜单数据是否加载成功
      console.log(`📊 管理端菜单数据: ${adminMenus.length} 项`);
      console.log(`📊 卖家端菜单数据: ${sellerMenus.length} 项`);

      if (adminMenus.length === 0) {
        console.error('❌ 管理端菜单数据为空！请检查 menu-data.ts 文件加载逻辑');
        console.error('💡 提示: 可能需要检查 scripts/admin-menu-data.js 文件是否存在');

        // 尝试直接加载 admin-menu-data.js 文件
        try {
          console.log('🔄 尝试直接加载菜单数据文件...');

          // 尝试多个可能的路径
          const possiblePaths = [
            path.join(process.cwd(), 'scripts', 'admin-menu-data.js'),
            path.join(process.cwd(), 'dist', 'scripts', 'admin-menu-data.js'),
            path.join(__dirname, '../../../../scripts/admin-menu-data.js'),
            path.join(__dirname, '../../../scripts/admin-menu-data.js'),
          ];

          let loaded = false;
          for (const filePath of possiblePaths) {
            if (fs.existsSync(filePath)) {
              console.log(`📂 找到菜单文件: ${filePath}`);
              const adminMenuData = await import(filePath);
              if (adminMenuData.adminMenus && adminMenuData.adminMenus.length > 0) {
                console.log(`✅ 成功加载 ${adminMenuData.adminMenus.length} 个菜单项`);
                // 重新构建菜单树
                const adminMenuTree = this.buildMenuTree(adminMenuData.adminMenus, 1);
                this.menuCache.set('admin', adminMenuTree);
                console.log(`✅ 管理端菜单初始化完成，共 ${adminMenuTree.length} 个顶级菜单`);
                loaded = true;
                break;
              }
            }
          }

          if (!loaded) {
            console.error('❌ 未能从任何位置加载菜单数据');
          }
        } catch (loadError) {
          console.error('❌ 直接加载菜单数据失败:', loadError);
        }
      } else {
        // 构建管理端菜单树
        const adminMenuTree = this.buildMenuTree(adminMenus, 1);
        this.menuCache.set('admin', adminMenuTree);
        console.log(`✅ 管理端菜单初始化完成，共 ${adminMenuTree.length} 个顶级菜单`);

        if (adminMenuTree.length > 0) {
          console.log(`📋 顶级菜单列表: ${adminMenuTree.map(m => m.title).join(', ')}`);

          // 打印所有管理端菜单的详细信息
          console.log('\n📋 管理端菜单详情:');
          adminMenuTree.forEach(topMenu => {
            console.log(`\n${this.getCategoryIcon(topMenu.title)} ${topMenu.title}`);
            console.log(`└── 路径: ${topMenu.path}`);

            if (topMenu.children && topMenu.children.length > 0) {
              topMenu.children.forEach(childMenu => {
                console.log(`    ├── ${childMenu.title}`);
                console.log(`    │   └── 路径: ${childMenu.path}`);

                if (childMenu.children && childMenu.children.length > 0) {
                  childMenu.children.forEach(subChildMenu => {
                    console.log(`    │   ├── ${subChildMenu.title}`);
                    console.log(`    │   │   └── 路径: ${subChildMenu.path}`);
                    if (subChildMenu.permission) {
                      console.log(`    │   │   └── 权限: ${subChildMenu.permission}`);
                    }
                  });
                } else if (childMenu.permission) {
                  console.log(`    │   └── 权限: ${childMenu.permission}`);
                }
              });
            }
          });
        }
      }

      // 构建卖家端菜单树
      const sellerMenuTree = this.buildMenuTree(sellerMenus, 2);
      this.menuCache.set('seller', sellerMenuTree);
      console.log(`✅ 卖家端菜单初始化完成，共 ${sellerMenuTree.length} 个顶级菜单`);

      if (sellerMenuTree.length > 0) {
        console.log(`📋 卖家端顶级菜单列表: ${sellerMenuTree.map(m => m.title).join(', ')}`);

        // 打印所有卖家端菜单的详细信息
        console.log('\n📋 卖家端菜单详情:');
        sellerMenuTree.forEach(topMenu => {
          console.log(`\n${this.getCategoryIcon(topMenu.title)} ${topMenu.title}`);
          console.log(`└── 路径: ${topMenu.path}`);

          if (topMenu.children && topMenu.children.length > 0) {
            topMenu.children.forEach(childMenu => {
              console.log(`    ├── ${childMenu.title}`);
              console.log(`    │   └── 路径: ${childMenu.path}`);

              if (childMenu.children && childMenu.children.length > 0) {
                childMenu.children.forEach(subChildMenu => {
                  console.log(`    │   ├── ${subChildMenu.title}`);
                  console.log(`    │   │   └── 路径: ${subChildMenu.path}`);
                  if (subChildMenu.permission) {
                    console.log(`    │   │   └── 权限: ${subChildMenu.permission}`);
                  }
                });
              } else if (childMenu.permission) {
                console.log(`    │   └── 权限: ${childMenu.permission}`);
              }
            });
          }
        });
      }

      // 初始化微信菜单
      await this.initializeWechatMenus();

      console.log('🎉 所有菜单初始化完成');
    } catch (error) {
      console.error('❌ 菜单初始化失败:', error);
      console.error('错误堆栈:', error instanceof Error ? error.stack : String(error));
    }
  }

  /**
   * 构建菜单树结构
   */
  private buildMenuTree(menus: MenuItem[], appType: number): MenuTree[] {
    const topLevelMenus = menus.filter(menu => menu.level === 0 && menu.appType === appType);

    return topLevelMenus
      .map(topMenu => {
        const children = this.getChildrenMenus(menus, topMenu.id, appType);

        return {
          ...topMenu,
          children: children.length > 0 ? children : undefined,
        };
      })
      .sort((a, b) => {
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      });
  }

  /**
   * 获取子菜单
   */
  private getChildrenMenus(menus: MenuItem[], parentId: string, appType: number): MenuTree[] {
    return menus
      .filter(menu => menu.parentId === parentId && menu.appType === appType)
      .map(menu => {
        const children = this.getChildrenMenus(menus, menu.id, appType);

        return {
          ...menu,
          children: children.length > 0 ? children : undefined,
        };
      })
      .sort((a, b) => {
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      });
  }

  /**
   * 显示微信菜单统计信息
   */
  private displayWechatMenuStats(wechatMenus: MenuItem[]): void {
    const categorizedMenus = this.categorizeWechatMenus(wechatMenus);

    console.log('📊 微信菜单统计信息:');
    console.log(`🎯 总模块数: ${Object.keys(categorizedMenus).length}`);
    console.log(`📋 总菜单项: ${wechatMenus.length}`);
    console.log(`🔗 权限配置: ${wechatMenus.filter(m => m.permission).length} 个`);

    Object.keys(categorizedMenus).forEach(category => {
      const categoryInfo = categorizedMenus[category];
      console.log(`\n${this.getCategoryIcon(category)} ${category}`);
      console.log(`└── 路径: /admin/wechat/${categoryInfo.path}`);

      if (Array.isArray(categoryInfo.submenus) && categoryInfo.submenus.length > 0) {
        (categoryInfo.submenus as any[]).forEach((submenu: any) => {
          console.log(`    ├── ${submenu.title}`);
          console.log(`    │   └── 权限: ${submenu.permission}`);
        });
      }
    });
  }

  /**
   * 分类微信菜单
   */
  private categorizeWechatMenus(menus: MenuItem[]): Record<string, any> {
    const categories = {};

    menus.forEach(menu => {
      if (menu.level === 1 && menu.parentId === 'admin-wechat') {
        const categoryName = menu.title;
        const categoryPath = menu.path.replace('/admin/wechat/', '');

        categories[categoryName] = {
          path: categoryPath,
          submenus: menus.filter(m => m.parentId === menu.id),
        };
      }
    });

    return categories;
  }

  /**
   * 获取分类图标
   */
  private getCategoryIcon(category: string): string {
    const icons = {
      消息管理: '💬',
      H5网页: '📱',
      微信卡券: '🎫',
      素材管理: '🖼️',
      自定义菜单: '📋',
      授权管理: '🔑',
    };

    return icons[category] || '📄';
  }

  /**
   * 获取管理端菜单树
   */
  async getAdminMenuTree(): Promise<MenuTree[]> {
    const menuTree = this.menuCache.get('admin') || [];

    // 如果缓存为空，尝试重新初始化
    if (menuTree.length === 0) {
      if (adminMenus.length > 0) {
        console.warn('⚠️ 菜单缓存为空，但菜单数据存在，尝试重新构建菜单树...');
        const adminMenuTree = this.buildMenuTree(adminMenus, 1);
        this.menuCache.set('admin', adminMenuTree);
        console.log(`✅ 重新构建完成，共 ${adminMenuTree.length} 个顶级菜单`);
        return adminMenuTree;
      } else {
        // 尝试直接加载 admin-menu-data.js 文件
        try {
          console.log('🔄 尝试直接加载菜单数据文件...');

          // 尝试多个可能的路径
          const possiblePaths = [
            path.join(process.cwd(), 'scripts', 'admin-menu-data.js'),
            path.join(process.cwd(), 'dist', 'scripts', 'admin-menu-data.js'),
            path.join(__dirname, '../../../../scripts/admin-menu-data.js'),
            path.join(__dirname, '../../../scripts/admin-menu-data.js'),
          ];

          for (const filePath of possiblePaths) {
            if (fs.existsSync(filePath)) {
              console.log(`📂 找到菜单文件: ${filePath}`);
              const adminMenuData = await import(filePath);
              if (adminMenuData.adminMenus && adminMenuData.adminMenus.length > 0) {
                console.log(`✅ 成功加载 ${adminMenuData.adminMenus.length} 个菜单项`);
                const adminMenuTree = this.buildMenuTree(adminMenuData.adminMenus, 1);
                this.menuCache.set('admin', adminMenuTree);
                console.log(`✅ 重新构建完成，共 ${adminMenuTree.length} 个顶级菜单`);
                return adminMenuTree;
              }
            }
          }

          console.error('❌ 未能从任何位置加载菜单数据');
        } catch (loadError) {
          console.error('❌ 直接加载菜单数据失败:', loadError);
        }
      }
    }

    return menuTree;
  }

  /**
   * 获取卖家端菜单树
   */
  getSellerMenuTree(): MenuTree[] {
    return this.menuCache.get('seller') || [];
  }

  /**
   * 获取微信菜单树
   */
  getWechatMenuTree(): MenuTree[] {
    return this.menuCache.get('wechat') || [];
  }

  /**
   * 获取微信菜单配置
   */
  getWechatMenu(): WechatMenu {
    const wechatMenus = this.menuCache.get('wechat') || [];

    // 将菜单树转换为微信菜单格式
    return {
      button: wechatMenus.map(menu => ({
        name: menu.title,
        type: 'view',
        url: menu.path,
        sub_button: menu.children
          ? menu.children.map(child => ({
              name: child.title,
              type: 'view',
              url: child.path,
            }))
          : undefined,
      })),
    };
  }

  /**
   * 初始化微信菜单
   */
  private async initializeWechatMenus(): Promise<void> {
    try {
      // 从管理端菜单中筛选出微信相关菜单
      const wechatMenus = adminMenus.filter(
        menu => menu.parentId === 'admin-wechat' || menu.parentId?.startsWith('admin-wechat-'),
      );

      // 构建微信菜单树
      const wechatMenuTree = this.buildMenuTree(wechatMenus, 1);
      this.menuCache.set('wechat', wechatMenuTree);

      console.log(`✅ 微信菜单初始化完成，共 ${wechatMenus.length} 个菜单项`);

      // 显示微信菜单统计
      this.displayWechatMenuStats(wechatMenus);
    } catch (error) {
      console.error('❌ 微信菜单初始化失败:', error);
    }
  }

  /**
   * 根据用户角色获取菜单
   */
  async getUserMenuTree(userType: 'admin' | 'seller', permissions: string[]): Promise<MenuTree[]> {
    const menuTree =
      userType === 'admin' ? await this.getAdminMenuTree() : this.getSellerMenuTree();

    return this.filterMenuByPermissions(menuTree, permissions);
  }

  /**
   * 根据权限过滤菜单
   */
  private filterMenuByPermissions(menuTree: MenuTree[], permissions: string[]): MenuTree[] {
    // 如果权限列表为空，返回所有菜单数据
    if (permissions.length === 0) {
      return menuTree
        .map(menu => {
          const filteredChildren = menu.children
            ? this.filterMenuByPermissions(menu.children, permissions)
            : undefined;

          return {
            ...menu,
            children: filteredChildren,
          };
        })
        .filter(menu => menu !== null) as MenuTree[];
    }

    return menuTree
      .map(menu => {
        const filteredChildren = menu.children
          ? this.filterMenuByPermissions(menu.children, permissions)
          : undefined;

        // 如果菜单有权限要求，检查用户是否有权限
        if (menu.permission && !permissions.includes(menu.permission)) {
          return null;
        }

        // 如果有子菜单且子菜单被过滤后为空，则隐藏该菜单
        if (filteredChildren && filteredChildren.length === 0) {
          return null;
        }

        return {
          ...menu,
          children: filteredChildren,
        };
      })
      .filter(menu => menu !== null) as MenuTree[];
  }
}
