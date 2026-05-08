import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as fs from 'fs';
import * as path from 'path';

interface LogContext {
  requestId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  module?: string;
  method?: string;
  [key: string]: any;
}

@Injectable()
export class AdvancedLoggerService implements OnModuleInit {
  private logger: winston.Logger;
  private readonly LOG_LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
  };

  constructor(private configService: ConfigService) {
    this.initLogger();
  }

  async onModuleInit() {
    console.log('Advanced logger service initialized');
  }

  private initLogger() {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const logLevel = this.configService.get('LOG_LEVEL') || 'info';

    // 定义日志格式
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    );

    const consoleFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const timeStr = JSON.stringify(timestamp);
        const msgStr = message instanceof Error ? message.message : JSON.stringify(message);
        return `${timeStr} [${level}]: ${msgStr} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
      }),
    );

    // 创建logger实例
    this.logger = winston.createLogger({
      level: logLevel,
      levels: this.LOG_LEVELS,
      format: logFormat,
      defaultMeta: {
        service: 'mall-eco-api',
        version: '1.0.0',
      },
      transports: [
        // 控制台输出（开发环境）
        new winston.transports.Console({
          format: consoleFormat,
          level: isProduction ? 'warn' : 'debug',
        }),

        // 每日轮转文件（生产环境）
        new winston.transports.DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          level: 'info',
        }),

        // 错误日志单独文件
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '90d',
          level: 'error',
        }),

        // HTTP请求日志
        new winston.transports.DailyRotateFile({
          filename: 'logs/http-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          level: 'http',
        }),
      ],
    });

    // 处理未捕获的异常
    this.logger.exceptions.handle(new winston.transports.File({ filename: 'logs/exceptions.log' }));

    // 处理未处理的Promise拒绝
    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled Promise Rejection:', {
        reason,
        promise,
        stack: new Error().stack,
      });
    });
  }

  // ==================== 基础日志方法 ====================

  error(message: string, context?: LogContext) {
    this.logger.error(message, context);
  }

  warn(message: string, context?: LogContext) {
    this.logger.warn(message, context);
  }

  info(message: string, context?: LogContext) {
    this.logger.info(message, context);
  }

  http(message: string, context?: LogContext) {
    this.logger.http(message, context);
  }

  verbose(message: string, context?: LogContext) {
    this.logger.verbose(message, context);
  }

  debug(message: string, context?: LogContext) {
    this.logger.debug(message, context);
  }

  // ==================== 业务日志方法 ====================

  /**
   * 记录用户操作日志
   */
  userAction(userId: string, action: string, resource: string, details?: any, ip?: string) {
    this.info(`User action: ${action}`, {
      userId,
      action,
      resource,
      details,
      ip,
      module: 'user',
      type: 'action',
    });
  }

  /**
   * 记录订单相关日志
   */
  orderLog(orderId: string, action: string, details?: any, userId?: string) {
    this.info(`Order ${action}: ${orderId}`, {
      orderId,
      action,
      details,
      userId,
      module: 'order',
      type: 'business',
    });
  }

  /**
   * 记录支付相关日志
   */
  paymentLog(paymentId: string, action: string, amount?: number, details?: any) {
    this.info(`Payment ${action}: ${paymentId}`, {
      paymentId,
      action,
      amount,
      details,
      module: 'payment',
      type: 'business',
    });
  }

  /**
   * 记录安全相关日志
   */
  securityLog(event: string, level: 'info' | 'warn' | 'error', details?: any, ip?: string) {
    this[level](`Security event: ${event}`, {
      event,
      details,
      ip,
      module: 'security',
      type: 'security',
    });
  }

  /**
   * 记录性能日志
   */
  performanceLog(operation: string, duration: number, details?: any) {
    this.info(`Performance: ${operation} took ${duration}ms`, {
      operation,
      duration,
      details,
      module: 'performance',
      type: 'performance',
    });
  }

  // ==================== 审计日志方法 ====================

  /**
   * 记录敏感操作审计日志
   */
  auditLog(
    userId: string,
    action: string,
    resource: string,
    beforeState?: any,
    afterState?: any,
    ip?: string,
  ) {
    this.info(`Audit: ${action} on ${resource}`, {
      userId,
      action,
      resource,
      beforeState,
      afterState,
      ip,
      module: 'audit',
      type: 'audit',
    });
  }

  /**
   * 记录数据变更审计日志
   */
  dataChangeLog(
    userId: string,
    table: string,
    recordId: string,
    operation: 'create' | 'update' | 'delete',
    oldData?: any,
    newData?: any,
  ) {
    this.info(`Data ${operation}: ${table}.${recordId}`, {
      userId,
      table,
      recordId,
      operation,
      oldData,
      newData,
      module: 'data',
      type: 'audit',
    });
  }

  // ==================== 工具方法 ====================

  /**
   * 生成请求ID
   */
  generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 创建日志上下文
   */
  createContext(baseContext?: LogContext): LogContext {
    return {
      requestId: this.generateRequestId(),
      timestamp: new Date().toISOString(),
      ...baseContext,
    };
  }

  /**
   * 获取日志统计信息
   */
  async getLogStats(): Promise<{
    totalLogs: number;
    errorCount: number;
    warnCount: number;
    infoCount: number;
    lastHourStats: any;
  }> {
    // 定义日志目录
    const logDir = path.join(process.cwd(), 'logs');
    let totalLogs = 0;
    let errorCount = 0;
    let warnCount = 0;
    let infoCount = 0;

    // 统计最近24小时的日志
    const lastHourStats: any = {};
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 24);

    // 检查日志目录是否存在
    if (!fs.existsSync(logDir)) {
      return {
        totalLogs: 0,
        errorCount: 0,
        warnCount: 0,
        infoCount: 0,
        lastHourStats: {},
      };
    }

    // 读取日志目录中的文件
    const files = fs.readdirSync(logDir);

    // 只处理未压缩的日志文件
    const logFiles = files.filter((file: string) => file.endsWith('.log') && !file.endsWith('.gz'));

    // 遍历所有日志文件
    for (const file of logFiles) {
      const filePath = path.join(logDir, file);
      try {
        // 读取文件内容
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(Boolean);

        // 遍历每一行日志
        for (const line of lines) {
          try {
            const log = JSON.parse(line);
            totalLogs++;

            // 按级别统计
            if (log.level === 'error') {
              errorCount++;
            } else if (log.level === 'warn') {
              warnCount++;
            } else if (log.level === 'info') {
              infoCount++;
            }

            // 统计最近24小时的日志
            const logTime = new Date(log.timestamp);
            if (logTime >= oneHourAgo) {
              const hour = logTime.getHours();
              lastHourStats[hour] = (lastHourStats[hour] || 0) + 1;
            }
          } catch (parseError) {
            // 忽略解析错误的日志行
            continue;
          }
        }
      } catch (readError) {
        // 忽略读取错误的文件
        continue;
      }
    }

    return {
      totalLogs,
      errorCount,
      warnCount,
      infoCount,
      lastHourStats,
    };
  }

  /**
   * 日志搜索
   */
  async searchLogs(
    query: string,
    level?: string,
    startTime?: Date,
    endTime?: Date,
    limit: number = 100,
  ): Promise<any[]> {
    // 定义日志目录
    const logDir = path.join(process.cwd(), 'logs');
    const results: any[] = [];

    // 检查日志目录是否存在
    if (!fs.existsSync(logDir)) {
      return results;
    }

    // 读取日志目录中的文件
    const files = fs.readdirSync(logDir);

    // 只处理未压缩的日志文件
    const logFiles = files.filter((file: string) => file.endsWith('.log') && !file.endsWith('.gz'));

    // 按日期排序，最新的文件优先
    logFiles.sort((a: string, b: string) => {
      const dateA = this.extractDateFromFilename(a);
      const dateB = this.extractDateFromFilename(b);
      return dateB.getTime() - dateA.getTime();
    });

    // 遍历所有日志文件
    for (const file of logFiles) {
      const filePath = path.join(logDir, file);
      try {
        // 读取文件内容
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(Boolean);

        // 按行倒序遍历，最新的日志优先
        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i];
          try {
            const log = JSON.parse(line);

            // 过滤条件
            let match = true;

            // 搜索关键词
            if (query && !this.matchesQuery(log, query)) {
              match = false;
            }

            // 过滤日志级别
            if (level && log.level !== level) {
              match = false;
            }

            // 过滤时间范围
            const logTime = new Date(log.timestamp);
            if (startTime && logTime < startTime) {
              match = false;
            }
            if (endTime && logTime > endTime) {
              match = false;
            }

            if (match) {
              results.push(log);

              // 达到限制数量，返回结果
              if (results.length >= limit) {
                return results;
              }
            }
          } catch (parseError) {
            // 忽略解析错误的日志行
            continue;
          }
        }
      } catch (readError) {
        // 忽略读取错误的文件
        continue;
      }
    }

    return results;
  }

  /**
   * 从日志文件名中提取日期
   */
  private extractDateFromFilename(filename: string): Date {
    const match = filename.match(/-(\d{4}-\d{2}-\d{2})\.log/);
    if (match && match[1]) {
      return new Date(match[1]);
    }
    return new Date(0); // 默认返回 epoch 时间
  }

  /**
   * 检查日志是否匹配查询条件
   */
  private matchesQuery(log: any, query: string): boolean {
    const searchStr = JSON.stringify(log).toLowerCase();
    return searchStr.includes(query.toLowerCase());
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{
    status: string;
    message?: string;
    details?: any;
  }> {
    try {
      // 检查日志目录是否存在，不存在则创建
      const logDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      // 检查日志文件是否可写
      const testFile = path.join(logDir, 'test-write.log');
      fs.writeFileSync(testFile, 'test write\n', { flag: 'a' });
      fs.unlinkSync(testFile);

      return {
        status: 'healthy',
        details: {
          transports: this.logger.transports.length,
          level: this.logger.level,
          logDir: logDir,
        },
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        message: error.message,
        details: { error: error.message },
      };
    }
  }

  /**
   * 清理旧日志
   */
  async cleanupOldLogs(daysToKeep: number = 30): Promise<{
    deletedFiles: number;
    totalSize: number;
  }> {
    // 计算过期日期
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // 定义日志目录
    const logDir = path.join(process.cwd(), 'logs');
    let deletedFiles = 0;
    let totalSize = 0;

    // 检查日志目录是否存在
    if (!fs.existsSync(logDir)) {
      return {
        deletedFiles: 0,
        totalSize: 0,
      };
    }

    // 读取日志目录中的所有文件
    const files = fs.readdirSync(logDir);

    // 遍历所有文件
    for (const file of files) {
      const filePath = path.join(logDir, file);
      try {
        // 获取文件状态
        const stats = fs.statSync(filePath);

        // 跳过目录
        if (stats.isDirectory()) {
          continue;
        }

        // 检查文件是否为日志文件
        if (!file.endsWith('.log') && !file.endsWith('.gz')) {
          continue;
        }

        // 提取文件日期
        const fileDate = this.extractDateFromFilename(file);

        // 如果文件日期早于过期日期，删除文件
        if (fileDate < cutoffDate) {
          // 累加删除的文件大小
          totalSize += stats.size;

          // 删除文件
          fs.unlinkSync(filePath);
          deletedFiles++;
        }
      } catch (error) {
        // 忽略删除错误
        continue;
      }
    }

    return {
      deletedFiles,
      totalSize,
    };
  }
}
