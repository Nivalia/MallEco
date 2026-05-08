/**
 * 幂等性配置
 */
export interface IdempotencyConfig {
  /**
   * 是否启用
   */
  enabled: boolean;

  /**
   * 过期时间(秒)
   */
  ttl: number;

  /**
   * 请求头名称
   */
  headerName: string;

  /**
   * 响应状态码
   */
  duplicateStatusCode: number;

  /**
   * 响应消息
   */
  duplicateMessage: string;
}

export const IdempotencyConfig: IdempotencyConfig = {
  enabled: true,
  ttl: 3600,
  headerName: 'X-Idempotency-Key',
  duplicateStatusCode: 409,
  duplicateMessage: '重复请求，请稍后重试',
};

/**
 * 幂等性结果
 */
export interface IdempotencyResult {
  /**
   * 是否是新请求
   */
  isNew: boolean;

  /**
   * 缓存的响应
   */
  cachedResponse?: any;

  /**
   * 释放函数
   */
  release?: () => Promise<void>;
}
