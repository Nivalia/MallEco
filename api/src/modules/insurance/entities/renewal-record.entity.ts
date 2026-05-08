import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { InsurancePolicy } from './insurance-policy.entity';
import { InsuranceCompany } from './insurance-company.entity';
import { PolicyHolder } from './policy-holder.entity';
import { InsuranceProduct } from './insurance-product.entity';

@Entity('renewal_record')
@Index(['policyId'])
@Index(['originalPolicyId'])
@Index(['insuranceCompanyId'])
@Index(['policyHolderId'])
@Index(['renewalStatus'])
@Index(['renewalDate'])
@Index(['effectiveDate'])
export class RenewalRecord extends BaseEntity {
  @Column({ name: 'renewal_number', unique: true, comment: '续保单号' })
  renewalNumber!: string;

  @Column({ name: 'policy_id', comment: '续保后保单ID' })
  policyId!: string;

  @ManyToOne(() => InsurancePolicy, policy => policy.id)
  @JoinColumn({ name: 'policy_id' })
  policy!: InsurancePolicy;

  @Column({ name: 'original_policy_id', comment: '原保单ID' })
  originalPolicyId!: string;

  @ManyToOne(() => InsurancePolicy, policy => policy.id)
  @JoinColumn({ name: 'original_policy_id' })
  originalPolicy!: InsurancePolicy;

  @Column({ name: 'insurance_company_id', comment: '保险公司ID' })
  insuranceCompanyId!: string;

  @ManyToOne(() => InsuranceCompany, company => company.id)
  @JoinColumn({ name: 'insurance_company_id' })
  insuranceCompany!: InsuranceCompany;

  @Column({ name: 'policy_holder_id', comment: '投保人ID' })
  policyHolderId!: string;

  @ManyToOne(() => PolicyHolder, holder => holder.id)
  @JoinColumn({ name: 'policy_holder_id' })
  policyHolder!: PolicyHolder;

  @Column({
    name: 'insurance_product_id',

    nullable: true,
    comment: '保险产品ID',
  })
  insuranceProductId!: string;

  @ManyToOne(() => InsuranceProduct, product => product.id)
  @JoinColumn({ name: 'insurance_product_id' })
  insuranceProduct!: InsuranceProduct;

  // 续保基本信息
  @Column({ name: 'renewal_date', type: 'date', comment: '续保日期' })
  renewalDate!: Date;

  @Column({ name: 'effective_date', type: 'date', comment: '续保生效日期' })
  effectiveDate!: Date;

  @Column({ name: 'expiry_date', type: 'date', comment: '续保失效日期' })
  expiryDate!: Date;

  @Column({ name: 'premium', type: 'decimal', precision: 15, scale: 2, comment: '续保费' })
  premium!: number;

  @Column({ name: 'original_premium', type: 'decimal', precision: 15, scale: 2, comment: '原保费' })
  originalPremium!: number;

  @Column({ name: 'premium_change', type: 'decimal', precision: 15, scale: 2, comment: '保费变化' })
  premiumChange!: number;

  @Column({ name: 'change_reason', type: 'text', nullable: true, comment: '变化原因' })
  changeReason!: string;

  // 续保状态
  @Column({
    name: 'renewal_status',
    type: 'tinyint',
    default: 0,
    comment: '续保状态: 0-待处理, 1-处理中, 2-已完成, 3-已拒绝',
  })
  renewalStatus!: number;

  @Column({ name: 'status_description', type: 'text', nullable: true, comment: '状态描述' })
  statusDescription!: string;

  // 续保流程信息
  @Column({ name: 'handler_id', nullable: true, comment: '处理人ID' })
  handlerId!: string;

  @Column({ name: 'handler_name', nullable: true, comment: '处理人姓名' })
  handlerName!: string;

  @Column({ name: 'process_start_date', type: 'date', nullable: true, comment: '处理开始日期' })
  processStartDate!: Date;

  @Column({ name: 'process_end_date', type: 'date', nullable: true, comment: '处理结束日期' })
  processEndDate!: Date;

  // 续保提醒信息
  @Column({ name: 'reminder_date', type: 'date', nullable: true, comment: '提醒日期' })
  reminderDate!: Date;

  @Column({ name: 'reminder_count', type: 'tinyint', default: 0, comment: '提醒次数' })
  reminderCount!: number;

  @Column({
    name: 'is_auto_renewal',
    type: 'tinyint',
    default: 0,
    comment: '是否自动续保: 1-是, 0-否',
  })
  isAutoRenewal!: number;

  // 备注信息
  @Column({ name: 'remarks', type: 'text', nullable: true, comment: '备注' })
  remarks!: string;

  // 审核信息
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

  @Column({ name: 'create_time', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createTime!: Date;

  @Column({ name: 'is_del', type: 'tinyint', default: 0 })
  isDel!: number;
}
