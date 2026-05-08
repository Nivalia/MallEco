import { registerAs } from '@nestjs/config';

/**
 * API 版本配置
 */
export const apiVersionConfig = registerAs('apiVersion', () => ({
  /**
   * 默认版本
   */
  default: process.env.API_VERSION_DEFAULT || 'v1',

  /**
   * 支持的版本列表
   */
  supported: (process.env.API_VERSION_SUPPORTED || 'v1,v2,v3').split(','),

  /**
   * 版本header名称
   */
  header: process.env.API_VERSION_HEADER || 'X-API-Version',

  /**
   * 是否启用版本控制
   */
  enabled: process.env.API_VERSION_ENABLED !== 'false',

  /**
   * 版本弃用策略
   */
  deprecation: {
    /**
     * 弃用版本列表
     */
    deprecated: (process.env.API_VERSION_DEPRECATED || '').split(',').filter(Boolean),
    /**
     * 弃用提示信息
     */
    warningMessage: 'This API version will be deprecated soon. Please use the latest version.',
  },
}));

/**
 * 获取当前支持的最新版本
 */
export function getLatestVersion(): string {
  const supported = apiVersionConfig().supported;
  return supported[supported.length - 1] || 'v1';
}

/**
 * 检查版本是否已弃用
 */
export function isVersionDeprecated(version: string): boolean {
  return apiVersionConfig().deprecation.deprecated.includes(version);
}
