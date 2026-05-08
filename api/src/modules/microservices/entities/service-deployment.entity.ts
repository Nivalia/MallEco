import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('service_deployment')
@Index(['serviceName', 'environment'])
export class ServiceDeploymentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '服务名称' })
  serviceName: string;

  @Column({ comment: '部署环境' })
  environment: string;

  @Column({ comment: '版本号' })
  version: string;

  @Column({ comment: '部署类型' })
  deploymentType: string;

  @Column({ comment: '部署状态' })
  status: string;

  @Column({ comment: '部署人' })
  deployedBy: string;

  @Column({ type: 'date', comment: '部署开始时间' })
  deployedAt: Date;

  @Column({ type: 'int', comment: '部署耗时(秒)' })
  deploymentDuration: number;

  @Column({ comment: '部署策略' })
  deploymentStrategy: string;

  @Column({ type: 'json', nullable: true, comment: '部署配置' })
  deploymentConfig: any;

  @Column({ type: 'json', nullable: true, comment: '环境变量' })
  environmentVariables: any;

  @Column({ type: 'json', nullable: true, comment: '资源配置' })
  resourceLimits: any;

  @Column({ comment: '健康检查结果' })
  healthCheckResult: string;

  @Column({ comment: '回滚版本' })
  rollbackVersion: string;

  @Column({ type: 'date', nullable: true, comment: '回滚时间' })
  rolledBackAt: Date;

  @Column({ type: 'text', nullable: true, comment: '部署日志' })
  deploymentLogs: string;

  @Column({ type: 'text', nullable: true, comment: '错误信息' })
  errorMessage: string;

  @Column({ type: 'boolean', comment: '是否灰度发布' })
  isCanary: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, comment: '灰度流量比例(%)' })
  canaryTrafficPercentage: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
