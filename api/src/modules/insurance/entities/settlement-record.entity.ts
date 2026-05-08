import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Channel } from './channel.entity';

@Entity('settlement_record')
@Index(['settlementType'])
@Index(['channelId', 'settlementPeriod'])
@Index(['status'])
@Index(['settlementDate'])
@Index(['settlementNumber'])
@Index(['settlementType', 'settlementPeriod'])
@Index(['status', 'settlementPeriod'])
@Index(['startDate', 'endDate'])
export class SettlementRecord extends BaseEntity {
  @Column({ name: 'settlement_number', unique: true, comment: '结算单号' })
  settlementNumber!: string;

  @Column({ name: 'settlement_type', type: 'tinyint', comment: '结算类型: 1-下游结算, 2-上游结算' })
  settlementType!: number;

  @Column({ name: 'channel_id', type: 'int', comment: '渠道ID' })
  channelId!: number;

  @ManyToOne(() => Channel, channel => channel.id)
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @Column({ name: 'settlement_period', comment: '结算期间(如: 2024-01)' })
  settlementPeriod!: string;

  @Column({ name: 'start_date', type: 'date', comment: '结算开始日期' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'date', comment: '结算结束日期' })
  endDate!: Date;

  @Column({ name: 'total_policies', type: 'int', default: 0, comment: '结算保单数量' })
  totalPolicies!: number;

  @Column({
    name: 'total_premium',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '总保费',
  })
  totalPremium!: number;

  @Column({
    name: 'total_commission',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '总佣金',
  })
  totalCommission!: number;

  @Column({
    name: 'tax_amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '税额',
  })
  taxAmount!: number;

  @Column({
    name: 'net_amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '净额',
  })
  netAmount!: number;

  @Column({ name: 'settlement_date', type: 'date', nullable: true, comment: '结算日期' })
  settlementDate!: Date;

  @Column({ name: 'settlement_method', nullable: true, comment: '结算方式' })
  settlementMethod!: string;

  @Column({ name: 'bank_account', nullable: true, comment: '收款账户' })
  bankAccount!: string;

  @Column({ name: 'bank_name', nullable: true, comment: '开户行' })
  bankName!: string;

  @Column({
    name: 'status',
    type: 'tinyint',
    default: 1,
    comment: '结算状态: 1-待确认, 2-已确认, 3-已支付, 4-已取消',
  })
  status!: number;

  @Column({ name: 'confirmed_by', nullable: true, comment: '确认人' })
  confirmedBy!: string;

  @Column({ name: 'confirmed_at', type: 'datetime', nullable: true, comment: '确认时间' })
  confirmedAt!: Date;

  @Column({ name: 'paid_by', nullable: true, comment: '付款人' })
  paidBy!: string;

  @Column({ name: 'paid_at', type: 'datetime', nullable: true, comment: '付款时间' })
  paidAt!: Date;

  @Column({ name: 'remarks', type: 'text', nullable: true, comment: '备注' })
  remarks!: string;

  @Column({ name: 'create_time', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createTime!: Date;
}
