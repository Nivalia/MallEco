import { Column, Entity, ForeignKey, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { InsuranceCompany } from './insurance-company.entity';

@Entity('insurance_product')
@Index(['companyId'])
@Index(['productCode'])
@Index(['productName'])
export class InsuranceProduct extends BaseEntity {
  @Column({ name: 'product_code', unique: true, comment: '产品代码' })
  productCode!: string;

  @Column({ name: 'product_name', comment: '产品名称' })
  productName!: string;

  @Column({ name: 'insurance_type', comment: '险别类型' })
  insuranceType!: string;

  @Column({ name: 'description', type: 'text', nullable: true, comment: '产品描述' })
  description!: string;

  @Column({ name: 'company_id', type: 'varchar', comment: '保险公司ID' })
  companyId!: string;

  @ManyToOne(() => InsuranceCompany)
  @JoinColumn({ name: 'company_id' })
  company!: InsuranceCompany;

  @Column({
    name: 'price',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    comment: '保费',
  })
  price!: number;

  @Column({
    name: 'upstream_policy',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '上游政策',
  })
  upstreamPolicy!: number;

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
    name: 'downstream_policy',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '下游政策',
  })
  downstreamPolicy!: number;

  @Column({
    name: 'downstream_commission',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    comment: '下游佣金',
  })
  downstreamCommission!: number;

  @Column({ name: 'tax_deductible', type: 'boolean', default: false, comment: '是否扣税' })
  taxDeductible!: boolean;

  @Column({ name: 'status', type: 'tinyint', default: 1, comment: '状态: 1-启用, 0-禁用' })
  status!: number;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序' })
  sortOrder!: number;

  @Column({ name: 'is_del', type: 'tinyint', default: 0 })
  isDel!: number;
}
