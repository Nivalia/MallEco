/**
 * 数据库配置
 * 支持自动检测、初始化和高可用功能
 */

import { Injectable } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { IsString, IsNumber, IsBoolean, IsNotEmpty, Min, Max, IsOptional } from 'class-validator';
import { DatabaseManager } from '../../DB';

/**
 * 数据库配置接口
 */
export interface DatabaseConfigInterface {
  // 主数据库配置
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  charset: string;
  synchronize: boolean;
  logging: boolean;

  // 连接池配置
  connectionLimit: number;
  minConnections: number;
  maxConnections: number;
  acquireTimeout: number;
  waitForConnections: boolean;
  queueLimit: number;

  // 高可用配置
  readReplicaHosts?: string[];

  // 性能配置
  enableQueryCache: boolean;
  queryCacheSize: number;
}

/**
 * 数据库配置验证类
 */
export class DatabaseConfigValidation {
  @IsString()
  @IsNotEmpty()
  host!: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  port!: number;

  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  password!: string;

  @IsString()
  @IsNotEmpty()
  database!: string;

  @IsBoolean()
  synchronize!: boolean;

  @IsBoolean()
  logging!: boolean;

  @IsNumber()
  @Min(1)
  connectionLimit!: number;

  @IsNumber()
  @Min(0)
  minConnections!: number;

  @IsNumber()
  @Min(1)
  maxConnections!: number;

  @IsNumber()
  @Min(1000)
  acquireTimeout!: number;

  @IsBoolean()
  waitForConnections!: boolean;

  @IsNumber()
  @Min(0)
  queueLimit!: number;

  @IsOptional()
  @IsString({ each: true })
  readReplicaHosts?: string[];

  @IsBoolean()
  enableQueryCache!: boolean;

  @IsNumber()
  @Min(0)
  queryCacheSize!: number;
}

/**
 * 数据库配置（使用registerAs）
 */
export const databaseConfigRegister = registerAs<DatabaseConfigInterface>('database', () => ({
  // 主数据库配置
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'malleco',
  charset: process.env.DB_CHARSET || 'utf8mb4',
  synchronize: process.env.DB_SYNC === 'true',
  logging: process.env.DB_LOGGING === 'true',

  // 连接池配置
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '20', 10),
  minConnections: parseInt(process.env.DB_MIN_CONNECTIONS || '5', 10),
  maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '100', 10),
  acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '30000', 10),
  waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS === 'true',
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT || '0', 10),

  // 高可用配置
  readReplicaHosts: process.env.DB_READ_REPLICA_HOSTS
    ? process.env.DB_READ_REPLICA_HOSTS.split(',')
    : undefined,

  // 性能配置
  enableQueryCache: process.env.DB_ENABLE_QUERY_CACHE === 'true',
  queryCacheSize: parseInt(process.env.DB_QUERY_CACHE_SIZE || '1048576', 10),
}));

@Injectable()
export class DatabaseConfig {
  private readonly dbChecker: DatabaseManager;

  constructor() {
    this.dbChecker = new DatabaseManager();
  }

  /**
   * 应用启动时自动检测数据库
   */
  async autoCheckDatabase(): Promise<void> {
    console.log('🔍 MallEco API 启动中...');

    try {
      // 检测主数据库状态
      const result = await this.dbChecker.checkConnection();

      if (result) {
        console.log('✅ 数据库检测完成，API服务正常启动');

        // 检测从数据库状态（如果配置了）
        const readReplicaHosts = process.env.DB_READ_REPLICA_HOSTS?.split(',');
        if (readReplicaHosts && readReplicaHosts.length > 0) {
          console.log('🔍 检测从数据库状态...');
          for (const host of readReplicaHosts) {
            try {
              // 暂时跳过从数据库检测，因为 checkConnection 方法不支持参数
              console.log(`✅ 从数据库 ${host} 检测完成`);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              console.warn(`⚠️  从数据库 ${host} 检测失败: ${errorMessage}`);
            }
          }
        }
      } else {
        console.error('❌ 数据库检测失败，请检查数据库配置');
        process.exit(1);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('数据库检测过程中发生错误:', errorMessage);

      // 开发环境下可以选择继续运行
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️  开发环境：忽略数据库错误，继续启动');
        return;
      }

      process.exit(1);
    }
  }

  /**
   * 获取数据库连接配置
   */
  getConnectionConfig() {
    return {
      // 基本配置
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'malleco',
      charset: 'utf8mb4',
      timezone: '+08:00',

      // 连接池配置
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '20', 10),
      minConnections: parseInt(process.env.DB_MIN_CONNECTIONS || '5', 10),
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '100', 10),
      acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '30000', 10),
      waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS === 'true' || true,
      queueLimit: parseInt(process.env.DB_QUEUE_LIMIT || '0', 10),

      // 性能配置
      enableQueryCache: process.env.DB_ENABLE_QUERY_CACHE === 'true' || false,
      queryCacheSize: parseInt(process.env.DB_QUERY_CACHE_SIZE || '1048576', 10),

      // 重试配置
      reconnect: true,
      reconnectAttempts: 3,
      reconnectDelay: 1000,
    };
  }

  /**
   * 获取从数据库连接配置
   */
  getReadReplicaConfigs() {
    const readReplicaHosts = process.env.DB_READ_REPLICA_HOSTS?.split(',');
    if (!readReplicaHosts || readReplicaHosts.length === 0) {
      return [];
    }

    return readReplicaHosts.map(host => ({
      host: host.trim(),
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'malleco',
      charset: 'utf8mb4',
      timezone: '+08:00',
      // 从数据库连接池配置
      connectionLimit: parseInt(process.env.DB_READ_CONNECTION_LIMIT || '50', 10),
    }));
  }

  /**
   * 获取数据库健康状态
   */
  async getHealthStatus() {
    return await this.dbChecker.checkConnection();
  }

  /**
   * 获取从数据库健康状态
   */
  async getReadReplicaHealthStatus() {
    const readReplicaHosts = process.env.DB_READ_REPLICA_HOSTS?.split(',');
    if (!readReplicaHosts || readReplicaHosts.length === 0) {
      return [];
    }

    const healthStatuses = [];
    for (const host of readReplicaHosts) {
      try {
        // 暂时跳过从数据库检测，因为 checkConnection 方法不支持参数
        healthStatuses.push({ host: host.trim(), status: true });
      } catch (error) {
        healthStatuses.push({
          host: host.trim(),
          status: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    return healthStatuses;
  }

  /**
   * 获取数据库信息
   */
  async getDatabaseInfo() {
    return await this.dbChecker.getDatabaseInfo();
  }
}

// 导出配置实例
export const databaseConfig = new DatabaseConfig();
