import { registerAs } from '@nestjs/config';

/**
 * Redis 配置
 * 参考：MallEcoPro/src/config/redis.config.ts
 */
export interface RedisConfig {
  host: string;
  port: number;
  password: string;
  db: number;
  keyPrefix: string;
  socket?: {
    connectTimeout: number;
    reconnectStrategy?: (retries: number) => number | Error;
  };
}

/**
 * Redis 配置注册
 */
export default registerAs('redis', (): RedisConfig => {
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'mall_eco:',
    socket: {
      connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT, 10) || 10000,
      reconnectStrategy: (retries: number): number | Error => {
        const maxRetries = parseInt(process.env.REDIS_MAX_RETRIES, 10) || 10;
        if (retries > maxRetries) {
          return new Error('Max redis connection retries reached');
        }
        return Math.min(retries * 100, 3000);
      },
    },
  };
});

/**
 * 获取 Redis 连接配置
 * @returns Redis 连接配置
 */
export const getRedisConnectionConfig = (): RedisConfig => {
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'mall_eco:',
    socket: {
      connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT, 10) || 10000,
    },
  };
};
