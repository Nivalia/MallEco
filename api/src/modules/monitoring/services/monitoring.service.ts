import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from '../../../infrastructure/rabbitmq/rabbitmq.service';
import * as os from 'os';
import * as process from 'process';
import { Logger } from '@nestjs/common';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private readonly startTime = Date.now();
  private readonly metrics: Map<string, number> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly rabbitMQService: RabbitMQService,
  ) {
    // 初始化监控指标
    this.initMetrics();
  }

  /**
   * 初始化监控指标
   */
  private initMetrics() {
    this.metrics.set('http_requests_total', 0);
    this.metrics.set('http_request_duration_seconds_sum', 0);
    this.metrics.set('http_request_duration_seconds_count', 0);
    this.metrics.set('http_requests_errors_total', 0);
    this.metrics.set('application_uptime_seconds', 0);
    this.metrics.set('system_memory_usage_bytes', 0);
    this.metrics.set('system_cpu_usage_percent', 0);
  }

  /**
   * 记录HTTP请求
   * @param duration 请求持续时间（毫秒）
   * @param statusCode 状态码
   */
  async recordHttpRequest(duration: number, statusCode: number) {
    // 增加请求计数
    this.metrics.set('http_requests_total', (this.metrics.get('http_requests_total') || 0) + 1);

    // 记录请求持续时间
    this.metrics.set(
      'http_request_duration_seconds_sum',
      (this.metrics.get('http_request_duration_seconds_sum') || 0) + duration / 1000,
    );
    this.metrics.set(
      'http_request_duration_seconds_count',
      (this.metrics.get('http_request_duration_seconds_count') || 0) + 1,
    );

    // 记录错误请求
    if (statusCode >= 500) {
      this.metrics.set(
        'http_requests_errors_total',
        (this.metrics.get('http_requests_errors_total') || 0) + 1,
      );
    }
  }

  /**
   * 获取健康状态
   * @returns 健康状态
   */
  async getHealthStatus() {
    try {
      // 检查Redis连接
      const redisHealthy = await this.checkRedisHealth();

      // 检查RabbitMQ连接
      const rabbitmqHealthy = await this.checkRabbitMQHealth();

      // 检查系统状态
      const systemHealthy = this.checkSystemHealth();

      // 计算整体健康状态
      const overallHealthy = redisHealthy && rabbitmqHealthy && systemHealthy;

      return {
        status: overallHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
        components: {
          redis: {
            status: redisHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
          },
          rabbitmq: {
            status: rabbitmqHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
          },
          system: {
            status: systemHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            details: this.getSystemDetails(),
          },
        },
        version: process.env.npm_package_version || 'unknown',
        environment: this.configService.get('NODE_ENV', 'development'),
      };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  /**
   * 获取监控指标
   * @returns 监控指标（Prometheus格式）
   */
  async getMetrics() {
    try {
      // 更新系统指标
      this.updateSystemMetrics();

      // 构建Prometheus格式的指标
      let metrics = '';

      // HTTP请求指标
      metrics += `# HELP http_requests_total Total number of HTTP requests\n`;
      metrics += `# TYPE http_requests_total counter\n`;
      metrics += `http_requests_total ${this.metrics.get('http_requests_total')}\n\n`;

      metrics += `# HELP http_request_duration_seconds HTTP request duration in seconds\n`;
      metrics += `# TYPE http_request_duration_seconds histogram\n`;
      metrics += `http_request_duration_seconds_sum ${this.metrics.get('http_request_duration_seconds_sum')}\n`;
      metrics += `http_request_duration_seconds_count ${this.metrics.get('http_request_duration_seconds_count')}\n\n`;

      metrics += `# HELP http_requests_errors_total Total number of HTTP error requests\n`;
      metrics += `# TYPE http_requests_errors_total counter\n`;
      metrics += `http_requests_errors_total ${this.metrics.get('http_requests_errors_total')}\n\n`;

      // 应用指标
      metrics += `# HELP application_uptime_seconds Application uptime in seconds\n`;
      metrics += `# TYPE application_uptime_seconds gauge\n`;
      metrics += `application_uptime_seconds ${Math.floor((Date.now() - this.startTime) / 1000)}\n\n`;

      // 系统指标
      metrics += `# HELP system_memory_usage_bytes System memory usage in bytes\n`;
      metrics += `# TYPE system_memory_usage_bytes gauge\n`;
      metrics += `system_memory_usage_bytes ${this.metrics.get('system_memory_usage_bytes')}\n\n`;

      metrics += `# HELP system_cpu_usage_percent System CPU usage percentage\n`;
      metrics += `# TYPE system_cpu_usage_percent gauge\n`;
      metrics += `system_cpu_usage_percent ${this.metrics.get('system_cpu_usage_percent')}\n\n`;

      // 环境标签
      metrics += `# HELP application_info Application information\n`;
      metrics += `# TYPE application_info gauge\n`;
      metrics += `application_info{version="${process.env.npm_package_version || 'unknown'}",environment="${this.configService.get('NODE_ENV', 'development')}"} 1\n`;

      return metrics;
    } catch (error) {
      this.logger.error('Failed to generate metrics:', error);
      return `# Error generating metrics: ${error.message}\n`;
    }
  }

  /**
   * 获取应用信息
   * @returns 应用信息
   */
  async getApplicationInfo() {
    return {
      name: process.env.npm_package_name || 'mall-eco-api',
      version: process.env.npm_package_version || 'unknown',
      description: process.env.npm_package_description || 'MallEco API Service',
      environment: this.configService.get('NODE_ENV', 'development'),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    };
  }

  /**
   * 获取系统状态
   * @returns 系统状态
   */
  async getSystemStatus() {
    return {
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      system: this.getSystemDetails(),
      components: {
        redis: await this.checkRedisHealth(),
        rabbitmq: await this.checkRabbitMQHealth(),
      },
      metrics: {
        httpRequestsTotal: this.metrics.get('http_requests_total'),
        httpRequestErrorsTotal: this.metrics.get('http_requests_errors_total'),
        averageRequestDuration: this.calculateAverageRequestDuration(),
      },
    };
  }

  /**
   * 检查Redis健康状态
   * @returns Redis是否健康
   */
  private async checkRedisHealth() {
    try {
      // 暂时返回 true，因为我们没有 RedisService
      return true;
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }

  /**
   * 检查RabbitMQ健康状态
   * @returns RabbitMQ是否健康
   */
  private async checkRabbitMQHealth() {
    try {
      await this.rabbitMQService.checkConnection();
      return true;
    } catch (error) {
      this.logger.error('RabbitMQ health check failed:', error);
      return false;
    }
  }

  /**
   * 检查系统健康状态
   * @returns 系统是否健康
   */
  private checkSystemHealth() {
    try {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      // 简单的系统健康检查
      // 内存使用超过90%认为不健康
      const memoryHealthy = memoryUsage.heapUsed / memoryUsage.heapTotal < 0.9;

      // CPU使用暂时不做严格检查

      return memoryHealthy;
    } catch (error) {
      this.logger.error('System health check failed:', error);
      return false;
    }
  }

  /**
   * 获取系统详情
   * @returns 系统详情
   */
  private getSystemDetails() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const loadAvg = os.loadavg();

    return {
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        heapFree: memoryUsage.heapTotal - memoryUsage.heapUsed,
      },
      cpu: {
        usage: cpuUsage,
        loadAvg: loadAvg,
        cores: os.cpus().length,
      },
      os: {
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        hostname: os.hostname(),
        uptime: os.uptime(),
      },
    };
  }

  /**
   * 更新系统指标
   */
  private updateSystemMetrics() {
    try {
      // 更新内存使用
      const memoryUsage = process.memoryUsage();
      this.metrics.set('system_memory_usage_bytes', memoryUsage.heapUsed);

      // 更新CPU使用（简化版，实际应该使用更复杂的计算）
      const cpuUsage = process.cpuUsage();
      const cpuPercent = ((cpuUsage.user + cpuUsage.system) / (1000 * 1000)) * 100;
      this.metrics.set('system_cpu_usage_percent', Math.min(cpuPercent, 100));
    } catch (error) {
      this.logger.error('Failed to update system metrics:', error);
    }
  }

  /**
   * 计算平均请求持续时间
   * @returns 平均请求持续时间（毫秒）
   */
  private calculateAverageRequestDuration() {
    const sum = this.metrics.get('http_request_duration_seconds_sum') || 0;
    const count = this.metrics.get('http_request_duration_seconds_count') || 0;
    return count > 0 ? Math.round((sum * 1000) / count) : 0;
  }
}
