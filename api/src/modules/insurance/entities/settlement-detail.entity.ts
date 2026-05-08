import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { SettlementRecord } from './settlement-record.entity';
import { InsurancePolicy } from './insurance-policy.entity';

@Entity('settlement_detail')
@Index(['settlementId'])
@Index(['policyId'])
export class SettlementDetail extends BaseEntity {
  @Column({ name: 'settlement_id', comment: '结算记录ID' })
  settlementId!: string;

  @ManyToOne(() => SettlementRecord, settlement => settlement.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'settlement_id' })
  settlement!: SettlementRecord;

  @Column({ name: 'policy_id', comment: '保单ID' })
  policyId!: string;

  @ManyToOne(() => InsurancePolicy, policy => policy.id)
  @JoinColumn({ name: 'policy_id' })
  policy!: InsurancePolicy;

  @Column({ name: 'premium', type: 'decimal', precision: 15, scale: 2, comment: '保费' })
  premium!: number;

  @Column({ name: 'commission_rate', type: 'decimal', precision: 5, scale: 4, comment: '佣金率' })
  commissionRate!: number;

  @Column({
    name: 'commission_amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    comment: '佣金金额',
  })
  commissionAmount!: number;

  @Column({ name: 'tax_included', type: 'tinyint', default: 0, comment: '是否含税' })
  taxIncluded!: number;

  @Column({
    name: 'tax_amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    comment: '税额',
  })
  taxAmount!: number;

  @Column({ name: 'net_amount', type: 'decimal', precision: 15, scale: 2, comment: '净额' })
  netAmount!: number;
}
