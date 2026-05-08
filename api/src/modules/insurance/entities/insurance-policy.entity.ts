import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { PolicyHolder } from './policy-holder.entity';
import { InsuranceCompany } from './insurance-company.entity';
import { InsuranceProduct } from './insurance-product.entity';
import { Channel } from './channel.entity';

@Entity('insurance_policy')
@Index(['policyHolderId'])
@Index(['insuranceCompanyId'])
@Index(['channelId'])
@Index(['upstreamChannelId'])
@Index(['effectiveDate'])
@Index(['expiryDate'])
@Index(['policyStatus'])
@Index(['downstreamSettled'])
@Index(['upstreamSettled'])
@Index(['auditStatus'])
@Index(['policyNumber'])
@Index(['insuranceCompanyId', 'effectiveDate'])
@Index(['channelId', 'effectiveDate'])
@Index(['policyStatus', 'effectiveDate'])
@Index(['auditStatus', 'effectiveDate'])
@Index(['issueDate'])
export class InsurancePolicy extends BaseEntity {
  @Column({ name: 'policy_number', unique: true, comment: '保单号' })
  policyNumber!: string;

  @Column({ name: 'policy_holder_id', comment: '投保人ID' })
  policyHolderId!: string;

  @ManyToOne(() => PolicyHolder, holder => holder.id)
  @JoinColumn({ name: 'policy_holder_id' })
  policyHolder!: PolicyHolder;

  @Column({ name: 'insurance_company_id', comment: '保险公司ID' })
  insuranceCompanyId!: string;

  @ManyToOne(() => InsuranceCompany, company => company.id)
  @JoinColumn({ name: 'insurance_company_id' })
  insuranceCompany!: InsuranceCompany;

  @Column({
    name: 'insurance_product_id',

    nullable: true,
    comment: '保险产品ID',
  })
  insuranceProductId!: string;

  @ManyToOne(() => InsuranceProduct, product => product.id)
  @JoinColumn({ name: 'insurance_product_id' })
  insuranceProduct!: InsuranceProduct;

  @Column({ name: 'insurance_type', comment: '险别' })
  insuranceType!: string;

  @Column({ name: 'channel_id', comment: '渠道ID' })
  channelId!: string;

  @ManyToOne(() => Channel, channel => channel.id)
  @JoinColumn({ name: 'channel_id' })
  channel!: Channel;

  @Column({
    name: 'upstream_channel_id',

    nullable: true,
    comment: '上游渠道ID',
  })
  upstreamChannelId!: string;

  @ManyToOne(() => Channel, channel => channel.id)
  @JoinColumn({ name: 'upstream_channel_id' })
  upstreamChannel!: Channel;

  // 保单基本信息
  @Column({ name: 'effective_date', type: 'date', comment: '生效日期' })
  effectiveDate!: Date;

  @Column({ name: 'expiry_date', type: 'date', comment: '失效日期' })
  expiryDate!: Date;

  @Column({ name: 'premium', type: 'decimal', precision: 15, scale: 2, comment: '保费' })
  premium!: number;

  @Column({ name: 'tax_included', type: 'tinyint', default: 0, comment: '是否含税: 1-是, 0-否' })
  taxIncluded!: number;

  // 下游政策
  @Column({
    name: 'downstream_policy_rate',
    type: 'decimal',
    precision: 5,
    scale: 4,
    nullable: true,
    comment: '下游政策百分比',
  })
  downstreamPolicyRate!: number;

  @Column({
    name: 'downstream_commission',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    comment: '下游佣金',
  })
  downstreamCommission!: number;

  @Column({
    name: 'downstream_net_fee',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    comment: '下游净费',
  })
  downstreamNetFee!: number;

  @Column({
    name: 'downstream_settled',
    type: 'tinyint',
    default: 0,
    comment: '下游是否结算: 1-是, 0-否',
  })
  downstreamSettled!: number;

  @Column({
    name: 'downstream_settlement_date',
    type: 'date',
    nullable: true,
    comment: '下游结算日期',
  })
  downstreamSettlementDate!: Date;

  @Column({
    name: 'downstream_settlement_method',

    nullable: true,
    comment: '下游结算方式',
  })
  downstreamSettlementMethod!: string;

  // 上游政策
  @Column({
    name: 'upstream_policy_rate',
    type: 'decimal',
    precision: 5,
    scale: 4,
    nullable: true,
    comment: '上游政策百分比',
  })
  upstreamPolicyRate!: number;

  @Column({
    name: 'upstream_commission',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    comment: '上游佣金',
  })
  upstreamCommission!: number;

  @Column({
    name: 'upstream_settled',
    type: 'tinyint',
    default: 0,
    comment: '上游是否结算: 1-是, 0-否',
  })
  upstreamSettled!: number;

  @Column({
    name: 'upstream_settlement_date',
    type: 'date',
    nullable: true,
    comment: '上游结算日期',
  })
  upstreamSettlementDate!: Date;

  @Column({
    name: 'upstream_settlement_method',

    nullable: true,
    comment: '上游结算方式',
  })
  upstreamSettlementMethod!: string;

  // 税额计算
  @Column({
    name: 'tax_amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    comment: '税额',
  })
  taxAmount!: number;

  // 业务字段
  @Column({
    name: 'policy_status',
    type: 'tinyint',
    default: 1,
    comment: '保单状态: 1-生效中, 2-已到期, 3-已退保',
  })
  policyStatus!: number;

  @Column({ name: 'policy_year', type: 'year', nullable: true, comment: '保单年度' })
  policyYear!: number;

  @Column({ name: 'business_month', type: 'tinyint', nullable: true, comment: '业务月份' })
  businessMonth!: number;

  @Column({ name: 'issue_date', type: 'datetime', nullable: true, comment: '出单日期' })
  issueDate!: Date;

  @Column({ name: 'remarks', type: 'text', nullable: true, comment: '备注' })
  remarks!: string;

  // 审核状态
  @Column({
    name: 'audit_status',
    type: 'tinyint',
    default: 0,
    comment: '审核状态: 0-未审核, 1-已审核',
  })
  auditStatus!: number;

  @Column({ name: 'audit_by', nullable: true, comment: '审核人' })
  auditBy!: string;

  @Column({ name: 'audit_at', type: 'datetime', nullable: true, comment: '审核时间' })
  auditAt!: Date;

  @Column({ name: 'audit_remark', type: 'text', nullable: true, comment: '审核备注' })
  auditRemark!: string;

  @Column({ name: 'is_del', type: 'tinyint', default: 0 })
  isDel!: number;
}
