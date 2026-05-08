import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 支付方式配置接口
 */
export interface PaymentConfig {
  // 支付宝配置
  alipayAppId?: string;
  alipayPrivateKey?: string;
  alipayPublicKey?: string;
  alipayGateway?: string;
  alipaySignType?: string;

  // 微信支付配置
  wechatMchId?: string;
  wechatAppId?: string;
  wechatApiKey?: string;
  wechatCertPath?: string;
  wechatNotifyUrl?: string;

  // 通用配置
  notifyUrl?: string;
  returnUrl?: string;
  [key: string]: unknown;
}

@Entity('mall_payment_method')
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', nullable: false, comment: '支付方式名称' })
  name: string;

  @Column({
    name: 'code',
    type: 'varchar',

    nullable: false,
    unique: true,
    comment: '支付方式编码',
  })
  code: string;

  @Column({
    name: 'description',
    type: 'varchar',

    nullable: true,
    comment: '支付方式描述',
  })
  description: string;

  @Column({ name: 'icon', nullable: true, comment: '支付方式图标' })
  icon: string;

  @Column({ name: 'config', type: 'json', nullable: true, comment: '支付配置(JSON格式)' })
  config: PaymentConfig | null;

  @Column({
    name: 'status',
    type: 'tinyint',
    nullable: false,
    default: 1,
    comment: '状态: 0-禁用 1-启用',
  })
  status: number;

  @Column({ name: 'sort_order', type: 'int', nullable: false, default: 0, comment: '排序' })
  sortOrder: number;

  @CreateDateColumn({ name: 'create_time', type: 'datetime', nullable: false, comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'update_time', type: 'datetime', nullable: false, comment: '更新时间' })
  updatedAt: Date;
}
