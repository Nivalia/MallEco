/**
 * 分布式锁配置
 */
export interface LockConfig {
  /**
   * 默认过期时间(毫秒)
   */
  defaultTtl: number;

  /**
   * 重试等待时间(毫秒)
   */
  retryWait: number;

  /**
   * 最大重试次数
   */
  maxRetries: number;

  /**
   * 锁前缀
   */
  prefix: string;
}

export const LockConfig: LockConfig = {
  defaultTtl: 30000,
  retryWait: 100,
  maxRetries: 3,
  prefix: 'lock:',
};

/**
 * 锁获取结果
 */
export interface LockResult {
  success: boolean;
  lockKey: string;
  release?: () => Promise<void>;
}

/**
 * 分布式锁选项
 */
export interface LockOptions {
  /**
   * 过期时间(毫秒)
   */
  ttl?: number;

  /**
   * 描述
   */
  description?: string;

  /**
   * 是否自动释放
   */
  autoRelease?: boolean;
}
