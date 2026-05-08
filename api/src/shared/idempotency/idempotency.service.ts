import { Injectable, Logger, HttpException, HttpStatus, Inject, Optional } from '@nestjs/common';
import Redis from 'ioredis';
import { IdempotencyConfig, IdempotencyResult } from './idempotency.config';

export const REDIS_CLIENT = 'REDIS_CLIENT';

/**
 * 幂等性服务
 *
 * 用于防止重复提交，支持:
 * - 接口幂等
 * - 缓存响应
 * - 自动过期
 */
@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);
  private redis: Redis | null = null;

  constructor(@Optional() @Inject(REDIS_CLIENT) redisClient?: Redis) {
    this.redis = redisClient || null;
  }

  /**
   * 生成幂等键
   */
  generateKey(prefix: string, ...identifiers: string[]): string {
    return `idempotency:${prefix}:${identifiers.join(':')}`;
  }

  /**
   * 检查幂等性
   */
  async check(key: string): Promise<IdempotencyResult> {
    if (!IdempotencyConfig.enabled) {
      return { isNew: true };
    }

    const cached = await this.redis.get(key);

    if (cached) {
      const cachedResponse = JSON.parse(cached);
      this.logger.debug(`Idempotency key found: ${key}`);

      return {
        isNew: false,
        cachedResponse,
      };
    }

    if (!this.redis) {
      return {
        isNew: true,
        release: async () => {},
      };
    }

    // 创建幂等键
    await this.redis.set(key, '', 'EX', IdempotencyConfig.ttl);

    return {
      isNew: true,
      release: async () => {
        await this.redis?.del(key);
      },
    };
  }

  /**
   * 缓存响应
   */
  async cacheResponse(key: string, response: any): Promise<void> {
    if (!IdempotencyConfig.enabled) {
      return;
    }

    const responseData = JSON.stringify({
      data: response,
      timestamp: Date.now(),
    });

    await this.redis.set(key, responseData, 'EX', IdempotencyConfig.ttl);
    this.logger.debug(`Cached response for idempotency key: ${key}`);
  }

  /**
   * 从请求中提取幂等键
   */
  extractKeyFromRequest(
    headers: Record<string, string>,
    body: any,
    prefix: string = 'request',
  ): string | null {
    const idempotencyKey = headers[IdempotencyConfig.headerName.toLowerCase()];

    if (idempotencyKey) {
      return this.generateKey(prefix, idempotencyKey);
    }

    // 如果没有显式的幂等键，尝试使用 body 的 hash
    if (body) {
      const bodyHash = this.hashBody(body);
      return this.generateKey(prefix, bodyHash);
    }

    return null;
  }

  /**
   * 检查并抛出重复请求异常
   */
  async verify(key: string): Promise<void> {
    const result = await this.check(key);

    if (!result.isNew && result.cachedResponse) {
      throw new HttpException(
        {
          code: IdempotencyConfig.duplicateStatusCode,
          message: IdempotencyConfig.duplicateMessage,
          cachedResponse: result.cachedResponse.data,
        },
        IdempotencyConfig.duplicateStatusCode,
      );
    }
  }

  /**
   * 手动删除幂等键
   */
  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * 生成 body hash
   */
  private hashBody(body: any): string {
    const str = JSON.stringify(body);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}
