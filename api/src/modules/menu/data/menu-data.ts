import { MenuItem } from '../types/menu.types';
import * as path from 'path';
import * as fs from 'fs';

// 同步加载完整的菜单数据（从 scripts 目录）
function loadAdminMenuDataSync(): MenuItem[] {
  // 尝试多个可能的路径（按优先级排序）
  const possiblePaths = [
    // 1. 从项目根目录的 scripts 目录（开发环境）
    path.join(process.cwd(), 'scripts', 'admin-menu-data.js'),
    // 2. 从编译后的 dist 目录（生产环境）
    path.join(process.cwd(), 'dist', 'scripts', 'admin-menu-data.js'),
    // 3. 从当前文件位置的相对路径（编译后）
    path.join(__dirname, '../../../../scripts/admin-menu-data.js'),
    // 4. 从当前文件位置的相对路径（开发环境，如果 __dirname 指向 src）
    path.join(__dirname, '../../../scripts/admin-menu-data.js'),
  ];

  console.log('🔍 开始加载菜单数据...');
  console.log('📂 当前工作目录:', process.cwd());
  console.log('📂 当前文件目录:', __dirname);

  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        console.log(`📂 找到菜单文件: ${filePath}`);

        // 使用动态导入加载菜单数据
        const adminMenuData = require(filePath);
        const menus = adminMenuData.adminMenus || [];

        if (menus.length > 0) {
          console.log(`✅ 成功从 ${filePath} 加载了 ${menus.length} 个菜单项`);
          return menus;
        } else {
          console.warn(`⚠️ 文件 ${filePath} 存在但菜单数据为空`);
        }
      }
    } catch (error) {
      // 继续尝试下一个路径
      console.warn(
        `❌ 尝试加载 ${filePath} 失败:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  console.error('❌ 未能从任何位置加载菜单数据');
  return [];
}

// 同步加载菜单数据
const fullAdminMenus: MenuItem[] = loadAdminMenuDataSync();

// 使用完整的菜单数据，包含所有9大模块（会员、订单、商品、促销、店铺、运营、统计、设置、日志、公众号）
export const adminMenus: MenuItem[] = fullAdminMenus;

// 卖家端菜单（保持原有数据）
export const sellerMenus: MenuItem[] = [
  // ========== 卖家端菜单 ==========
  {
    id: 'seller-dashboard',
    title: '工作台',
    name: 'seller-dashboard',
    path: '/seller/dashboard',
    level: 0,
    frontRoute: 'seller/dashboard',
    parentId: null,
    sortOrder: 0,
    permission: '',
    icon: 'dashboard',
    description: '卖家工作台',
    type: 0,
    appType: 2,
  },
  {
    id: 'seller-goods',
    title: '商品管理',
    name: 'seller-goods',
    path: '/seller/goods',
    level: 0,
    frontRoute: 'seller/goods',
    parentId: null,
    sortOrder: 1,
    permission: '',
    icon: 'shopping',
    description: '商品管理',
    type: 0,
    appType: 2,
  },
  {
    id: 'seller-goods-list',
    title: '商品列表',
    name: 'seller-goods-list',
    path: '/seller/goods/list',
    level: 1,
    frontRoute: 'seller/goods/list',
    parentId: 'seller-goods',
    sortOrder: 0,
    permission: '/seller/goods/list',
    icon: 'unordered-list',
    description: '商品列表管理',
    type: 1,
    appType: 2,
  },
  {
    id: 'seller-goods-add',
    title: '添加商品',
    name: 'seller-goods-add',
    path: '/seller/goods/add',
    level: 1,
    frontRoute: 'seller/goods/add',
    parentId: 'seller-goods',
    sortOrder: 1,
    permission: '/seller/goods/add',
    icon: 'plus',
    description: '添加商品',
    type: 1,
    appType: 2,
  },
  {
    id: 'seller-goods-category',
    title: '商品分类',
    name: 'seller-goods-category',
    path: '/seller/goods/category',
    level: 1,
    frontRoute: 'seller/goods/category',
    parentId: 'seller-goods',
    sortOrder: 2,
    permission: '/seller/goods/category',
    icon: 'appstore',
    description: '商品分类管理',
    type: 1,
    appType: 2,
  },
  {
    id: 'seller-order',
    title: '订单管理',
    name: 'seller-order',
    path: '/seller/order',
    level: 0,
    frontRoute: 'seller/order',
    parentId: null,
    sortOrder: 2,
    permission: '',
    icon: 'solution',
    description: '订单管理',
    type: 0,
    appType: 2,
  },
  {
    id: 'seller-order-list',
    title: '订单列表',
    name: 'seller-order-list',
    path: '/seller/order/list',
    level: 1,
    frontRoute: 'seller/order/list',
    parentId: 'seller-order',
    sortOrder: 0,
    permission: '/seller/order/list',
    icon: 'ordered-list',
    description: '订单列表管理',
    type: 1,
    appType: 2,
  },
  {
    id: 'seller-order-refund',
    title: '退款管理',
    name: 'seller-order-refund',
    path: '/seller/order/refund',
    level: 1,
    frontRoute: 'seller/order/refund',
    parentId: 'seller-order',
    sortOrder: 1,
    permission: '/seller/order/refund',
    icon: 'rollback',
    description: '退款管理',
    type: 1,
    appType: 2,
  },
  {
    id: 'seller-order-shipping',
    title: '发货管理',
    name: 'seller-order-shipping',
    path: '/seller/order/shipping',
    level: 1,
    frontRoute: 'seller/order/shipping',
    parentId: 'seller-order',
    sortOrder: 2,
    permission: '/seller/order/shipping',
    icon: 'car',
    description: '发货管理',
    type: 1,
    appType: 2,
  },
  {
    id: 'seller-finance',
    title: '财务管理',
    name: 'seller-finance',
    path: '/seller/finance',
    level: 0,
    frontRoute: 'seller/finance',
    parentId: null,
    sortOrder: 3,
    permission: '',
    icon: 'account-book',
    description: '财务管理',
    type: 0,
    appType: 2,
  },
  {
    id: 'seller-finance-balance',
    title: '账户余额',
    name: 'seller-finance-balance',
    path: '/seller/finance/balance',
    level: 1,
    frontRoute: 'seller/finance/balance',
    parentId: 'seller-finance',
    sortOrder: 0,
    permission: '/seller/finance/balance',
    icon: 'dollar',
    description: '账户余额管理',
    type: 1,
    appType: 2,
  },
  {
    id: 'seller-finance-withdraw',
    title: '提现管理',
    name: 'seller-finance-withdraw',
    path: '/seller/finance/withdraw',
    level: 1,
    frontRoute: 'seller/finance/withdraw',
    parentId: 'seller-finance',
    sortOrder: 1,
    permission: '/seller/finance/withdraw',
    icon: 'bank',
    description: '提现管理',
    type: 1,
    appType: 2,
  },
  {
    id: 'seller-finance-bill',
    title: '账单明细',
    name: 'seller-finance-bill',
    path: '/seller/finance/bill',
    level: 1,
    frontRoute: 'seller/finance/bill',
    parentId: 'seller-finance',
    sortOrder: 2,
    permission: '/seller/finance/bill',
    icon: 'file-text',
    description: '账单明细管理',
    type: 1,
    appType: 2,
  },
  {
    id: 'seller-store',
    title: '店铺管理',
    name: 'seller-store',
    path: '/seller/store',
    level: 0,
    frontRoute: 'seller/store',
    parentId: null,
    sortOrder: 4,
    permission: '',
    icon: 'shop',
    description: '店铺管理',
    type: 0,
    appType: 2,
  },
  {
    id: 'seller-store-info',
    title: '店铺信息',
    name: 'seller-store-info',
    path: '/seller/store/info',
    level: 1,
    frontRoute: 'seller/store/info',
    parentId: 'seller-store',
    sortOrder: 0,
    permission: '/seller/store/info',
    icon: 'info-circle',
    description: '店铺信息管理',
    type: 1,
    appType: 2,
  },
  {
    id: 'seller-store-setting',
    title: '店铺设置',
    name: 'seller-store-setting',
    path: '/seller/store/setting',
    level: 1,
    frontRoute: 'seller/store/setting',
    parentId: 'seller-store',
    sortOrder: 1,
    permission: '/seller/store/setting',
    icon: 'setting',
    description: '店铺设置管理',
    type: 1,
    appType: 2,
  },
  {
    id: 'seller-store-decorate',
    title: '店铺装修',
    name: 'seller-store-decorate',
    path: '/seller/store/decorate',
    level: 1,
    frontRoute: 'seller/store/decorate',
    parentId: 'seller-store',
    sortOrder: 2,
    permission: '/seller/store/decorate',
    icon: 'highlight',
    description: '店铺装修管理',
    type: 1,
    appType: 2,
  },
];
