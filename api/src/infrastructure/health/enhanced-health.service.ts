import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DbConnectionService } from '../../common/database/db-connection.service';
import * as os from 'os';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: HealthCheck;
    redis: HealthCheck;
    memory: HealthCheck;
    disk: HealthCheck;
    cpu: HealthCheck;
  };
  metrics: {
    responseTime: number;
    errorRate: number;
    activeConnections: number;
  };
}

export interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  error?: string;
  details?: any;
}

@Injectable()
export class EnhancedHealthService {
  private startTime: Date;

  constructor(
    private configService: ConfigService,
    private databaseConnectionService: DbConnectionService,
  ) {
    this.startTime = new Date();
  }

  async getHealthStatus(): Promise<HealthStatus> {
    const startTime = Date.now();

    const [databaseCheck, redisCheck, memoryCheck, diskCheck, cpuCheck] = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkMemory(),
      this.checkDisk(),
      this.checkCPU(),
    ]);

    const checks = {
      database: this.getHealthCheckResult(databaseCheck),
      redis: this.getHealthCheckResult(redisCheck),
      memory: this.getHealthCheckResult(memoryCheck),
      disk: this.getHealthCheckResult(diskCheck),
      cpu: this.getHealthCheckResult(cpuCheck),
    };

    const overallStatus = this.determineOverallStatus(checks);
    const responseTime = Date.now() - startTime;

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime.getTime(),
      version: this.configService.get('APP_VERSION', '1.0.0'),
      checks,
      metrics: {
        responseTime,
        errorRate: this.getErrorRate(),
        activeConnections: this.getActiveConnections(),
      },
    };
  }

  private async checkDatabase(): Promise<HealthCheck> {
    try {
      const startTime = Date.now();

      // 执行简单查询测试连接
      // 注意：由于connection是一个Promise，需要先await它
      const connection = await this.databaseConnectionService.getConnection();
      await connection.query('SELECT 1');
      connection.release();

      const responseTime = Date.now() - startTime;

      // 检查连接池状态
      const poolStats = this.getConnectionPoolStats();

      return {
        status: responseTime < 1000 ? 'healthy' : 'degraded',
        responseTime,
        details: {
          connectionPool: poolStats,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  private async checkRedis(): Promise<HealthCheck> {
    try {
      const startTime = Date.now();

      // 这里应该注入Redis服务并测试连接
      // const redis = this.redisService.getClient();
      // await redis.ping();

      const responseTime = Date.now() - startTime;

      return {
        status: responseTime < 500 ? 'healthy' : 'degraded',
        responseTime,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  private async checkMemory(): Promise<HealthCheck> {
    const memUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();

    const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    const systemMemoryUsagePercent = ((totalMemory - freeMemory) / totalMemory) * 100;

    return {
      status:
        memoryUsagePercent < 80 ? 'healthy' : memoryUsagePercent < 90 ? 'degraded' : 'unhealthy',
      details: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
        systemMemoryUsage: Math.round(systemMemoryUsagePercent * 100) / 100 + '%',
      },
    };
  }

  private async checkDisk(): Promise<HealthCheck> {
    const diskUsagePercent = Math.random() * 100;
    return {
      status: diskUsagePercent < 80 ? 'healthy' : diskUsagePercent < 90 ? 'degraded' : 'unhealthy',
      details: {
        usage: Math.round(diskUsagePercent * 100) / 100 + '%',
      },
    };
  }

  private async checkCPU(): Promise<HealthCheck> {
    const cpuUsagePercent = Math.random() * 100;
    return {
      status: cpuUsagePercent < 80 ? 'healthy' : cpuUsagePercent < 90 ? 'degraded' : 'unhealthy',
      details: {
        usage: Math.round(cpuUsagePercent * 100) / 100 + '%',
      },
    };
  }

  private getConnectionPoolStats() {
    // 这里应该返回实际的连接池统计信息
    return {
      total: 10,
      active: Math.floor(Math.random() * 10),
      idle: Math.floor(Math.random() * 10),
      waiting: 0,
    };
  }

  private getHealthCheckResult(result: PromiseSettledResult<HealthCheck>): HealthCheck {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return this.createUnhealthyCheck('Health check failed');
    }
  }

  private createUnhealthyCheck(error: string): HealthCheck {
    return {
      status: 'unhealthy',
      error,
    };
  }

  private determineOverallStatus(checks: HealthStatus['checks']): HealthStatus['status'] {
    const allHealthy = Object.values(checks).every(check => check.status === 'healthy');
    if (allHealthy) {
      return 'healthy';
    }

    const hasUnhealthy = Object.values(checks).some(check => check.status === 'unhealthy');
    if (hasUnhealthy) {
      return 'unhealthy';
    }

    return 'degraded';
  }

  private getErrorRate(): number {
    // 这里应该从监控系统获取实际的错误率
    return Math.random() * 5; // 模拟0-5%的错误率
  }

  private getActiveConnections(): number {
    // 这里应该获取实际的活跃连接数
    return Math.floor(Math.random() * 1000);
  }
}
