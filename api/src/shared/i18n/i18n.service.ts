import { Injectable } from '@nestjs/common';
import { I18nConfig, SupportedLocale, LocaleNames } from './i18n.config';

/**
 * 国际化服务
 */
@Injectable()
export class I18nService {
  private translations: Map<string, Record<string, string>> = new Map();
  private currentLocale: string;

  constructor() {
    this.currentLocale = I18nConfig.defaultLocale;
    this.loadTranslations();
  }

  /**
   * 加载翻译文件
   */
  private loadTranslations(): void {
    this.translations.set('zh-CN', {
      // 通用
      'common.success': '操作成功',
      'common.fail': '操作失败',
      'common.error': '错误',
      'common.warning': '警告',
      'common.info': '提示',
      'common.confirm': '确认',
      'common.cancel': '取消',
      'common.submit': '提交',
      'common.reset': '重置',
      'common.search': '搜索',
      'common.add': '新增',
      'common.edit': '编辑',
      'common.delete': '删除',
      'common.view': '查看',
      'common.export': '导出',
      'common.import': '导入',

      // 错误
      'error.badRequest': '请求参数错误',
      'error.unauthorized': '未授权，请先登录',
      'error.forbidden': '没有权限访问该资源',
      'error.notFound': '资源不存在',
      'error.internalError': '服务器内部错误',
      'error.timeout': '请求超时',

      // 验证
      'validation.required': '该字段为必填项',
      'validation.email': '请输入有效的邮箱地址',
      'validation.phone': '请输入有效的手机号码',
      'validation.minLength': '最少输入 {min} 个字符',
      'validation.maxLength': '最多输入 {max} 个字符',
      'validation.pattern': '格式不正确',

      // 用户
      'user.notFound': '用户不存在',
      'user.alreadyExists': '用户已存在',
      'user.disabled': '用户已被禁用',
      'user.passwordError': '密码错误',

      // 认证
      'auth.loginFailed': '登录失败',
      'auth.tokenExpired': '登录已过期，请重新登录',
      'auth.tokenInvalid': '无效的令牌',

      // 订单
      'order.notFound': '订单不存在',
      'order.statusInvalid': '订单状态不正确',
      'order.cancelFailed': '取消订单失败',

      // 商品
      'goods.notFound': '商品不存在',
      'goods.stockInsufficient': '商品库存不足',
      'goods.offline': '商品已下架',

      // 支付
      'payment.failed': '支付失败',
      'payment.timeout': '支付超时',
      'payment.balanceInsufficient': '余额不足',
    });

    this.translations.set('en-US', {
      'common.success': 'Success',
      'common.fail': 'Operation failed',
      'common.error': 'Error',
      'common.warning': 'Warning',
      'common.info': 'Info',
      'common.confirm': 'Confirm',
      'common.cancel': 'Cancel',
      'common.submit': 'Submit',
      'common.reset': 'Reset',
      'common.search': 'Search',
      'common.add': 'Add',
      'common.edit': 'Edit',
      'common.delete': 'Delete',
      'common.view': 'View',
      'common.export': 'Export',
      'common.import': 'Import',

      'error.badRequest': 'Bad request',
      'error.unauthorized': 'Unauthorized, please login first',
      'error.forbidden': 'Forbidden',
      'error.notFound': 'Resource not found',
      'error.internalError': 'Internal server error',
      'error.timeout': 'Request timeout',

      'validation.required': 'This field is required',
      'validation.email': 'Please enter a valid email address',
      'validation.phone': 'Please enter a valid phone number',
      'validation.minLength': 'Minimum {min} characters',
      'validation.maxLength': 'Maximum {max} characters',
      'validation.pattern': 'Invalid format',

      'user.notFound': 'User not found',
      'user.alreadyExists': 'User already exists',
      'user.disabled': 'User is disabled',
      'user.passwordError': 'Incorrect password',

      'auth.loginFailed': 'Login failed',
      'auth.tokenExpired': 'Token expired, please login again',
      'auth.tokenInvalid': 'Invalid token',

      'order.notFound': 'Order not found',
      'order.statusInvalid': 'Invalid order status',
      'order.cancelFailed': 'Failed to cancel order',

      'goods.notFound': 'Product not found',
      'goods.stockInsufficient': 'Insufficient stock',
      'goods.offline': 'Product is offline',

      'payment.failed': 'Payment failed',
      'payment.timeout': 'Payment timeout',
      'payment.balanceInsufficient': 'Insufficient balance',
    });

    this.translations.set('zh-TW', {
      'common.success': '操作成功',
      'common.fail': '操作失敗',
      'common.error': '錯誤',
      'common.warning': '警告',
      'common.info': '提示',
      'common.confirm': '確認',
      'common.cancel': '取消',
      'common.submit': '提交',
      'common.reset': '重置',
      'common.search': '搜索',
      'common.add': '新增',
      'common.edit': '編輯',
      'common.delete': '刪除',
      'common.view': '查看',
      'common.export': '導出',
      'common.import': '導入',

      'error.badRequest': '請求參數錯誤',
      'error.unauthorized': '未授權，請先登錄',
      'error.forbidden': '沒有權限訪問該資源',
      'error.notFound': '資源不存在',
      'error.internalError': '服務器內部錯誤',
      'error.timeout': '請求超時',

      'validation.required': '該欄位為必填項',
      'validation.email': '請輸入有效的郵箱地址',
      'validation.phone': '請輸入有效的手機號碼',
      'validation.minLength': '最少輸入 {min} 個字符',
      'validation.maxLength': '最多輸入 {max} 個字符',
      'validation.pattern': '格式不正確',

      'user.notFound': '用戶不存在',
      'user.alreadyExists': '用戶已存在',
      'user.disabled': '用戶已被禁用',
      'user.passwordError': '密碼錯誤',

      'auth.loginFailed': '登錄失敗',
      'auth.tokenExpired': '登錄已過期，請重新登錄',
      'auth.tokenInvalid': '無效的令牌',

      'order.notFound': '訂單不存在',
      'order.statusInvalid': '訂單狀態不正確',
      'order.cancelFailed': '取消訂單失敗',

      'goods.notFound': '商品不存在',
      'goods.stockInsufficient': '商品庫存不足',
      'goods.offline': '商品已下架',

      'payment.failed': '支付失敗',
      'payment.timeout': '支付超時',
      'payment.balanceInsufficient': '餘額不足',
    });
  }

  /**
   * 翻译 key
   */
  translate(key: string, params?: Record<string, string | number>, locale?: string): string {
    const currentLocale = locale || this.currentLocale;
    const translations = this.translations.get(currentLocale) || this.translations.get('zh-CN');

    let message = translations[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        message = message.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
      });
    }

    return message;
  }

  /**
   * 获取当前语言
   */
  getCurrentLocale(): string {
    return this.currentLocale;
  }

  /**
   * 设置当前语言
   */
  setLocale(locale: string): void {
    if (this.translations.has(locale)) {
      this.currentLocale = locale;
    }
  }

  /**
   * 获取支持的语言列表
   */
  getSupportedLocales(): { code: string; name: string }[] {
    return Object.entries(LocaleNames).map(([code, name]) => ({
      code,
      name,
    }));
  }

  /**
   * 从请求中获取语言
   */
  getLocaleFromRequest(header: string): string {
    if (!header) return this.currentLocale;

    const preferredLocale = header.split(',')[0].trim();

    if (this.translations.has(preferredLocale)) {
      return preferredLocale;
    }

    const baseLocale = preferredLocale.split('-')[0];
    const matchedLocale = Array.from(this.translations.keys()).find(locale =>
      locale.startsWith(baseLocale),
    );

    return matchedLocale || this.currentLocale;
  }
}
