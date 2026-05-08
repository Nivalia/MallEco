import { Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

/**
 * 审计日志实体
 */
export abstract class AuditLog {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ name: 'username', nullable: true })
  username: string;

  @Column({ name: 'module', nullable: false })
  module: string;

  @Column({ name: 'operation', nullable: false })
  operation: string;

  @Column({ name: 'method', nullable: false })
  method: string;

  @Column({ name: 'url', nullable: false })
  url: string;

  @Column({ name: 'ip', nullable: true })
  ip: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ type: 'text', nullable: true })
  request: string;

  @Column({ type: 'text', nullable: true })
  response: string;

  @Column({ name: 'status_code', type: 'int', nullable: true })
  statusCode: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'execution_time', type: 'int', nullable: true })
  executionTime: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

/**
 * 操作类型枚举
 */
export enum AuditOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  QUERY = 'QUERY',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  OTHER = 'OTHER',
}

/**
 * 审计日志配置
 */
export interface AuditLogConfig {
  /**
   * 是否启用
   */
  enabled: boolean;

  /**
   * 排除的路径
   */
  excludePaths: string[];

  /**
   * 包含的模块
   */
  includeModules: string[];

  /**
   * 最大请求体记录长度
   */
  maxRequestLength: number;

  /**
   * 最大响应体记录长度
   */
  maxResponseLength: number;
}

export const AuditLogConfig: AuditLogConfig = {
  enabled: true,
  excludePaths: ['/health', '/metrics', '/api-docs', '/api/health'],
  includeModules: [],
  maxRequestLength: 2000,
  maxResponseLength: 2000,
};
