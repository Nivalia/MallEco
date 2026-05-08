import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { ENTITY_OPTIONS } from '../../../common/entities/base.entity';

export enum PaymentStatus {
  PENDING = 0,
  SUCCESS = 1,
  FAILED = 2,
  REFUNDED = 3,
}

export enum PaymentMethod {
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
  BALANCE = 'balance',
}

@Entity('mall_payment_record', ENTITY_OPTIONS)
@Index(['orderId'])
@Index(['outTradeNo'], { unique: true })
@Index(['status'])
export class PaymentRecord {
  @Column({ type: 'bigint', primary: true, generated: 'increment' })
  id: string;

  @Column({ name: 'order_id', type: 'bigint' })
  orderId: string;

  @Column({ name: 'order_sn' })
  orderSn: string;

  @Column({ name: 'payment_method_code' })
  paymentMethodCode: string;

  @Column({ name: 'payment_method_name' })
  paymentMethodName: string;

  @Column({ name: 'amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount: number;

  @Column({ name: 'currency', default: 'CNY' })
  currency: string;

  @Column({ name: 'status', type: 'tinyint', default: PaymentStatus.PENDING })
  status: number;

  @Column({ name: 'trade_no', nullable: true })
  tradeNo: string;

  @Column({ name: 'out_trade_no', unique: true })
  outTradeNo: string;

  @Column({ name: 'notify_time', type: 'datetime', nullable: true })
  notifyTime: Date;

  @Column({ name: 'pay_time', type: 'datetime', nullable: true })
  payTime: Date;

  @Column({ name: 'refund_time', type: 'datetime', nullable: true })
  refundTime: Date;

  @Column({ name: 'client_ip', nullable: true })
  clientIp: string;

  @Column({ name: 'client_type', nullable: true })
  clientType: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ name: 'subject', nullable: true })
  subject: string;

  @Column({ name: 'body', nullable: true })
  body: string;

  @Column({ name: 'return_url', nullable: true })
  returnUrl: string;

  @Column({ name: 'extra_param', type: 'json', nullable: true })
  extraParam: Record<string, any>;

  @Column({ name: 'error_msg', nullable: true })
  errorMsg: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
