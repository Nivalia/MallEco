import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { InsurancePolicy } from './insurance-policy.entity';
import { InsuranceCompany } from './insurance-company.entity';
import { PolicyHolder } from './policy-holder.entity';

@Entity('claim_record')
@Index(['policyId'])
@Index(['insuranceCompanyId'])
@Index(['policyHolderId'])
@Index(['claimStatus'])
@Index(['claimDate'])
export class ClaimRecord extends BaseEntity {
  @Column({ name: 'claim_number', unique: true, comment: '理赔单号' })
  claimNumber!: string;

  @Column({ name: 'policy_id', comment: '关联保单ID' })
  policyId!: string;

  @ManyToOne(() => InsurancePolicy, policy => policy.id)
  @JoinColumn({ name: 'policy_id' })
  policy!: InsurancePolicy;

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

  // 理赔基本信息
  @Column({ name: 'claim_date', type: 'date', comment: '出险日期' })
  claimDate!: Date;

  @Column({ name: 'report_date', type: 'date', comment: '报案日期' })
  reportDate!: Date;

  @Column({ name: 'claim_amount', type: 'decimal', precision: 15, scale: 2, comment: '理赔金额' })
  claimAmount!: number;

  @Column({ name: 'claim_type', comment: '理赔类型' })
  claimType!: string;

  @Column({ name: 'claim_reason', type: 'text', comment: '理赔原因' })
  claimReason!: string;

  @Column({ name: 'accident_location', comment: '事故地点' })
  accidentLocation!: string;

  // 理赔状态
  @Column({
    name: 'claim_status',
    type: 'tinyint',
    default: 0,
    comment: '理赔状态: 0-待处理, 1-处理中, 2-已完成, 3-已拒绝',
  })
  claimStatus!: number;

  @Column({ name: 'status_description', type: 'text', nullable: true, comment: '状态描述' })
  statusDescription!: string;

  // 理赔流程信息
  @Column({ name: 'handler_id', nullable: true, comment: '处理人ID' })
  handlerId!: string;

  @Column({ name: 'handler_name', nullable: true, comment: '处理人姓名' })
  handlerName!: string;

  @Column({ name: 'process_start_date', type: 'date', nullable: true, comment: '处理开始日期' })
  processStartDate!: Date;

  @Column({ name: 'process_end_date', type: 'date', nullable: true, comment: '处理结束日期' })
  processEndDate!: Date;

  @Column({ name: 'processing_time', type: 'int', nullable: true, comment: '处理时长(天)' })
  processingTime!: number;

  // 理赔材料
  @Column({ name: 'required_documents', type: 'text', nullable: true, comment: '所需材料' })
  requiredDocuments!: string;

  @Column({ name: 'submitted_documents', type: 'text', nullable: true, comment: '已提交材料' })
  submittedDocuments!: string;

  @Column({
    name: 'document_status',
    type: 'tinyint',
    default: 0,
    comment: '材料状态: 0-未提交, 1-已提交, 2-审核中, 3-已审核',
  })
  documentStatus!: number;

  // 赔付信息
  @Column({
    name: 'payment_amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    comment: '实际赔付金额',
  })
  paymentAmount!: number;

  @Column({ name: 'payment_date', type: 'date', nullable: true, comment: '赔付日期' })
  paymentDate!: Date;

  @Column({ name: 'payment_method', nullable: true, comment: '赔付方式' })
  paymentMethod!: string;

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
