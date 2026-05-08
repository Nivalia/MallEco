import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { getRedisConnectionConfig } from '../../config/redis.config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;
  private readonly logger = new Logger(RedisService.name);
  private isConnected = false;

  constructor() {
    const config = getRedisConnectionConfig();
    this.redis = new Redis(config);

    // 事件监听
    this.redis.on('connect', () => {
      this.isConnected = true;
      this.logger.log('Redis connected successfully');
    });

    this.redis.on('error', error => {
      this.isConnected = false;
      this.logger.error('Redis connection error:', error);
    });

    this.redis.on('close', () => {
      this.isConnected = false;
      this.logger.log('Redis connection closed');
    });

    this.redis.on('reconnecting', (params: { attempt: number; delay: number }) => {
      this.logger.log(`Redis reconnecting: attempt ${params.attempt}`);
    });

    this.redis.on('end', () => {
      this.isConnected = false;
      this.logger.log('Redis connection ended');
    });
  }

  async onModuleInit() {
    this.logger.log('Initializing Redis service...');
    try {
      await this.ping();
      this.logger.log('Redis service initialized successfully');
    } catch (error) {
      this.logger.warn('Redis service initialization failed:', error);
      // 继续启动，Redis可能在稍后可用
    }
  }

  async onModuleDestroy() {
    this.logger.log('Closing Redis connection...');
    try {
      await this.redis.quit();
      this.logger.log('Redis connection closed successfully');
    } catch (error) {
      this.logger.error('Error closing Redis connection:', error);
    }
  }

  /**
   * 检查Redis连接状态
   */
  isRedisConnected(): boolean {
    return this.isConnected;
  }

  /**
   * 发送PING命令测试连接
   */
  async ping(): Promise<string> {
    try {
      return await this.redis.ping();
    } catch (error) {
      this.logger.error('Redis ping failed:', error);
      throw error;
    }
  }

  /**
   * 设置键值对
   * @param key 键
   * @param value 值
   * @param ttl 过期时间（秒）
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      if (ttl) {
        await this.redis.set(key, stringValue, 'EX', ttl);
      } else {
        await this.redis.set(key, stringValue);
      }
    } catch (error) {
      this.logger.error(`Redis set failed for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 获取值
   * @param key 键
   * @param parseJson 是否解析JSON
   */
  async get(key: string, parseJson: boolean = true): Promise<any> {
    try {
      const value = await this.redis.get(key);
      if (value === null) {
        return null;
      }
      if (parseJson) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    } catch (error) {
      this.logger.error(`Redis get failed for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 删除键
   * @param key 键
   */
  async del(key: string): Promise<number> {
    try {
      return await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Redis del failed for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 检查键是否存在
   * @param key 键
   */
  async exists(key: string): Promise<number> {
    try {
      return await this.redis.exists(key);
    } catch (error) {
      this.logger.error(`Redis exists failed for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 设置键的过期时间
   * @param key 键
   * @param seconds 过期时间（秒）
   */
  async expire(key: string, seconds: number): Promise<number> {
    try {
      return await this.redis.expire(key, seconds);
    } catch (error) {
      this.logger.error(`Redis expire failed for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 获取键的剩余过期时间
   * @param key 键
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      this.logger.error(`Redis ttl failed for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 递增键的值
   * @param key 键
   */
  async incr(key: string): Promise<number> {
    try {
      return await this.redis.incr(key);
    } catch (error) {
      this.logger.error(`Redis incr failed for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 递减键的值
   * @param key 键
   */
  async decr(key: string): Promise<number> {
    try {
      return await this.redis.decr(key);
    } catch (error) {
      this.logger.error(`Redis decr failed for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 向列表左侧添加元素
   * @param key 键
   * @param values 值
   */
  async lpush(key: string, ...values: any[]): Promise<number> {
    try {
      const stringValues = values.map(v => (typeof v === 'string' ? v : JSON.stringify(v)));
      return await this.redis.lpush(key, ...stringValues);
    } catch (error) {
      this.logger.error(`Redis lpush failed for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 向列表右侧添加元素
   * @param key 键
   * @param values 值
   */
  async rpush(key: string, ...values: any[]): Promise<number> {
    try {
      const stringValues = values.map(v => (typeof v === 'string' ? v : JSON.stringify(v)));
      return await this.redis.rpush(key, ...stringValues);
    } catch (error) {
      this.logger.error(`Redis rpush failed for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 从列表左侧弹出元素
   * @param key 键
   * @param parseJson 是否解析JSON
   */
  async lpop(key: string, parseJson: boolean = true): Promise<any> {
    try {
      const value = await this.redis.lpop(key);
      if (value === null) {
        return null;
      }
      if (parseJson) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    } catch (error) {
      this.logger.error(`Redis lpop failed for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 从列表右侧弹出元素
   * @param key 键
   * @param parseJson 是否解析JSON
   */
  async rpop(key: string, parseJson: boolean = true): Promise<any> {
    try {
      const value = await this.redis.rpop(key);
      if (value === null) {
        return null;
      }
      if (parseJson) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    } catch (error) {
      this.logger.error(`Redis rpop failed for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 获取列表长度
   * @param key 键
   */
  async llen(key: string): Promise<number> {
    try {
      return await this.redis.llen(key);
    } catch (error) {
      this.logger.error(`Redis llen failed for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 获取列表范围内的元素
   * @param key 键
   * @param start 开始索引
   * @param stop 结束索引
   * @param parseJson 是否解析JSON
   */
  async lrange(
    key: string,
    start: number,
    stop: number,
    parseJson: boolean = true,
  ): Promise<any[]> {
    try {
      const values = await this.redis.lrange(key, start, stop);
      if (!parseJson) {
        return values;
      }
      return values.map(value => {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      });
    } catch (error) {
      this.logger.error(`Redis lrange failed for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 向哈希表添加字段
   * @param key 键
   * @param field 字段
   * @param value 值
   */
  async hset(key: string, field: string, value: any): Promise<number> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      return await this.redis.hset(key, field, stringValue);
    } catch (error) {
      this.logger.error(`Redis hset failed for key ${key}, field ${field}:`, error);
      throw error;
    }
  }

  /**
   * 获取哈希表字段的值
   * @param key 键
   * @param field 字段
   * @param parseJson 是否解析JSON
   */
  async hget(key: string, field: string, parseJson: boolean = true): Promise<any> {
    try {
      const value = await this.redis.hget(key, field);
      if (value === null) {
        return null;
      }
      if (parseJson) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    } catch (error) {
      this.logger.error(`Redis hget failed for key ${key}, field ${field}:`, error);
      throw error;
    }
  }

  /**
   * 获取哈希表所有字段和值
   * @param key 键
   * @param parseJson 是否解析JSON
   */
  async hgetall(key: string, parseJson: boolean = true): Promise<Record<string, any>> {
    try {
      const values = await this.redis.hgetall(key);
      if (!parseJson) {
        return values;
      }
      const parsedValues: Record<string, any> = {};
      for (const [field, value] of Object.entries(values)) {
        try {
          parsedValues[field] = JSON.parse(value);
        } catch {
          parsedValues[field] = value;
        }
      }
      return parsedValues;
    } catch (error) {
      this.logger.error(`Redis hgetall failed for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 删除哈希表字段
   * @param key 键
   * @param fields 字段
   */
  async hdel(key: string, ...fields: string[]): Promise<number> {
    try {
      return await this.redis.hdel(key, ...fields);
    } catch (error) {
      this.logger.error(`Redis hdel failed for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 检查哈希表字段是否存在
   * @param key 键
   * @param field 字段
   */
  async hexists(key: string, field: string): Promise<number> {
    try {
      return await this.redis.hexists(key, field);
    } catch (error) {
      this.logger.error(`Redis hexists failed for key ${key}, field ${field}:`, error);
      throw error;
    }
  }

  /**
   * 添加集合元素
   * @param key 键
   * @param members 成员
   */
  async sadd(key: string, ...members: any[]): Promise<number> {
    try {
      const stringMembers = members.map(m => (typeof m === 'string' ? m : JSON.stringify(m)));
      return await this.redis.sadd(key, ...stringMembers);
    } catch (error) {
      this.logger.error(`Redis sadd failed for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 移除集合元素
   * @param key 键
   * @param members 成员
   */
  async srem(key: string, ...members: any[]): Promise<number> {
    try {
      const stringMembers = members.map(m => (typeof m === 'string' ? m : JSON.stringify(m)));
      return await this.redis.srem(key, ...stringMembers);
    } catch (error) {
      this.logger.error(`Redis srem failed for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 检查成员是否在集合中
   * @param key 键
   * @param member 成员
   */
  async sismember(key: string, member: any): Promise<number> {
    try {
      const stringMember = typeof member === 'string' ? member : JSON.stringify(member);
      return await this.redis.sismember(key, stringMember);
    } catch (error) {
      this.logger.error(`Redis sismember failed for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 获取集合所有成员
   * @param key 键
   * @param parseJson 是否解析JSON
   */
  async smembers(key: string, parseJson: boolean = true): Promise<any[]> {
    try {
      const members = await this.redis.smembers(key);
      if (!parseJson) {
        return members;
      }
      return members.map(member => {
        try {
          return JSON.parse(member);
        } catch {
          return member;
        }
      });
    } catch (error) {
      this.logger.error(`Redis smembers failed for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 获取集合大小
   * @param key 键
   */
  async scard(key: string): Promise<number> {
    try {
      return await this.redis.scard(key);
    } catch (error) {
      this.logger.error(`Redis scard failed for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 执行Redis命令
   * @param command 命令
   * @param args 参数
   */
  async executeCommand(command: string, ...args: any[]): Promise<any> {
    try {
      // 使用ioredis的call方法执行动态命令
      return await this.redis.call(command, ...args);
    } catch (error) {
      this.logger.error(`Redis command ${command} failed:`, error);
      throw error;
    }
  }

  /**
   * 刷新数据库
   * @param mode 模式 (async, sync)
   */
  async flushdb(mode: 'async' | 'sync' = 'async'): Promise<string> {
    try {
      if (mode === 'async') {
        return await this.redis.flushdb('ASYNC');
      } else {
        return await this.redis.flushdb('SYNC');
      }
    } catch (error) {
      this.logger.error('Redis flushdb failed:', error);
      throw error;
    }
  }

  /**
   * 获取Redis客户端实例
   */
  getClient(): Redis {
    return this.redis;
  }
}
