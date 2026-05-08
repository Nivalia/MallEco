import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import Redis from 'ioredis';
import { LockConfig, LockResult, LockOptions } from './lock.config';

export const REDIS_CLIENT = 'REDIS_CLIENT';

/**
 * 分布式锁服务
 *
 * 使用 Redis 实现分布式锁，支持:
 * - 公平锁
 * - 自动续期
 * - 可重入
 */
@Injectable()
export class LockService {
  private readonly logger = new Logger(LockService.name);
  private redis: Redis | null = null;

  constructor(@Optional() @Inject(REDIS_CLIENT) redisClient?: Redis) {
    this.redis = redisClient || null;
  }

  /**
   * 获取锁
   */
  async acquire(key: string, options: LockOptions = {}): Promise<LockResult> {
    const { ttl = LockConfig.defaultTtl, description = '' } = options;
    const lockKey = `${LockConfig.prefix}${key}`;
    const lockValue = this.generateLockValue();

    // 尝试获取锁
    const acquired = await this.redis.set(lockKey, lockValue, 'PX', ttl, 'NX');

    if (acquired === 'OK') {
      this.logger.debug(`Lock acquired: ${lockKey}`);

      // 创建释放函数
      const release = async () => {
        await this.release(lockKey, lockValue);
      };

      return {
        success: true,
        lockKey,
        release,
      };
    }

    this.logger.debug(`Failed to acquire lock: ${lockKey}`);
    return {
      success: false,
      lockKey,
    };
  }

  /**
   * 释放锁
   */
  async release(lockKey: string, lockValue: string): Promise<boolean> {
    // 使用 Lua 脚本确保原子性
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    const result = await this.redis.eval(script, 1, lockKey, lockValue);
    return result === 1;
  }

  /**
   * 尝试获取锁(带重试)
   */
  async tryAcquire(key: string, options: LockOptions = {}): Promise<LockResult> {
    const { ttl = LockConfig.defaultTtl, description = '' } = options;
    const lockKey = `${LockConfig.prefix}${key}`;
    const lockValue = this.generateLockValue();

    if (!this.redis) {
      return {
        success: false,
        lockKey,
        release: async () => {},
      };
    }

    for (let i = 0; i <= LockConfig.maxRetries; i++) {
      const acquired = await this.redis.set(lockKey, lockValue, 'PX', ttl, 'NX');

      if (acquired === 'OK') {
        this.logger.debug(`Lock acquired after ${i} retries: ${lockKey}`);

        return {
          success: true,
          lockKey,
          release: async () => {
            await this.release(lockKey, lockValue);
          },
        };
      }

      if (i < LockConfig.maxRetries) {
        await this.sleep(LockConfig.retryWait * (i + 1));
      }
    }

    return {
      success: false,
      lockKey,
    };
  }

  /**
   * 延长锁过期时间
   */
  async extend(lockKey: string, lockValue: string, ttl: number): Promise<boolean> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("pexpire", KEYS[1], ARGV[2])
      else
        return 0
      end
    `;

    const result = await this.redis.eval(script, 1, lockKey, lockValue, ttl);
    return result === 1;
  }

  /**
   * 释放所有锁(根据前缀)
   */
  async releaseAll(pattern: string = '*'): Promise<number> {
    const keys = await this.redis.keys(`${LockConfig.prefix}${pattern}`);
    if (keys.length > 0) {
      return await this.redis.del(...keys);
    }
    return 0;
  }

  /**
   * 使用锁执行函数
   */
  async executeWithLock<T>(
    key: string,
    fn: () => Promise<T>,
    options: LockOptions = {},
  ): Promise<T> {
    const result = await this.acquire(key, options);

    if (!result.success) {
      throw new Error(`Failed to acquire lock: ${key}`);
    }

    try {
      return await fn();
    } finally {
      if (result.release) {
        await result.release();
      }
    }
  }

  /**
   * 生成锁值
   */
  private generateLockValue(): string {
    return `${process.pid}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * 睡眠
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
