import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditOperation, AuditLogConfig } from './audit-log.entity';

/**
 * 审计日志服务
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  /**
   * 记录审计日志
   */
  async log(auditData: Partial<AuditLog>): Promise<void> {
    if (!AuditLogConfig.enabled) {
      return;
    }

    try {
      const log = this.auditRepository.create({
        userId: auditData.userId,
        username: auditData.username,
        module: auditData.module,
        operation: auditData.operation,
        method: auditData.method,
        url: auditData.url,
        ip: auditData.ip,
        userAgent: auditData.userAgent,
        request: this.truncate(auditData.request, AuditLogConfig.maxRequestLength),
        response: this.truncate(auditData.response, AuditLogConfig.maxResponseLength),
        statusCode: auditData.statusCode,
        errorMessage: auditData.errorMessage,
        executionTime: auditData.executionTime,
      });

      await this.auditRepository.save(log);
    } catch (error) {
      this.logger.error('Failed to write audit log', error);
    }
  }

  /**
   * 查询审计日志
   */
  async findAll(query: {
    page?: number;
    limit?: number;
    userId?: string;
    module?: string;
    operation?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ data: AuditLog[]; total: number }> {
    const { page = 1, limit = 10, userId, module, operation, startDate, endDate } = query;

    const where: any = {};
    if (userId) where.userId = userId;
    if (module) where.module = module;
    if (operation) where.operation = operation;
    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    const [data, total] = await this.auditRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  /**
   * 获取用户操作统计
   */
  async getUserStats(
    userId: string,
    days: number = 7,
  ): Promise<{
    total: number;
    byOperation: Record<string, number>;
    byModule: Record<string, number>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.auditRepository.find({
      where: {
        userId,
        createdAt: MoreThanOrEqual(startDate),
      },
    });

    const byOperation: Record<string, number> = {};
    const byModule: Record<string, number> = {};

    logs.forEach(log => {
      byOperation[log.operation] = (byOperation[log.operation] || 0) + 1;
      byModule[log.module] = (byModule[log.module] || 0) + 1;
    });

    return {
      total: logs.length,
      byOperation,
      byModule,
    };
  }

  /**
   * 截断字符串
   */
  private truncate(str: string | undefined, maxLength: number): string {
    if (!str) return '';
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  }
}

function Between(startDate: Date, endDate: Date): any {
  throw new Error('Function not implemented.');
}

function MoreThanOrEqual(startDate: Date): any {
  throw new Error('Function not implemented.');
}
