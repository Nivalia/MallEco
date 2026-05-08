import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('service_dependency')
@Index(['serviceName', 'dependencyServiceName'])
export class ServiceDependencyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '服务名称' })
  serviceName: string;

  @Column({ comment: '依赖服务名称' })
  dependencyServiceName: string;

  @Column({ comment: '依赖类型' })
  dependencyType: string;

  @Column({ comment: '依赖强度' })
  strength: string;

  @Column({ type: 'boolean', comment: '是否必需' })
  isRequired: boolean;

  @Column({ comment: '接口规范' })
  interfaceSpecification: string;

  @Column({ comment: '通信协议' })
  protocol: string;

  @Column({ type: 'int', comment: '超时时间(ms)' })
  timeout: number;

  @Column({ type: 'int', comment: '重试次数' })
  retryCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, comment: '调用频率/分钟' })
  callFrequency: number;

  @Column({ comment: '依赖状态' })
  status: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, comment: '平均响应时间(ms)' })
  avgResponseTime: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, comment: '成功率(%)' })
  successRate: number;

  @Column({ type: 'text', nullable: true, comment: '依赖描述' })
  description: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
