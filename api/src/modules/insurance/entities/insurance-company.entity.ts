import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';

@Entity('insurance_company')
@Index(['companyName'])
@Index(['companyCode'])
@Index(['status', 'sortOrder'])
export class InsuranceCompany extends BaseEntity {
  @Column({ name: 'company_code', unique: true, comment: '公司代码' })
  companyCode!: string;

  @Column({ name: 'company_name', comment: '公司名称' })
  companyName!: string;

  @Column({ name: 'short_name', nullable: true, comment: '简称' })
  shortName!: string;

  @Column({ name: 'contact_person', nullable: true, comment: '联系人' })
  contactPerson!: string;

  @Column({ name: 'contact_phone', nullable: true, comment: '联系电话' })
  contactPhone!: string;

  @Column({ name: 'address', nullable: true, comment: '地址' })
  address!: string;

  @Column({
    name: 'cooperation_status',
    type: 'tinyint',
    default: 1,
    comment: '合作状态: 1-合作中, 2-暂停, 3-终止',
  })
  cooperationStatus!: number;

  @Column({ name: 'settlement_period', type: 'int', default: 30, comment: '结算周期(天)' })
  settlementPeriod!: number;

  @Column({ name: 'bank_account', nullable: true, comment: '银行账号' })
  bankAccount!: string;

  @Column({ name: 'bank_name', nullable: true, comment: '开户行' })
  bankName!: string;

  @Column({ name: 'tax_number', nullable: true, comment: '税号' })
  taxNumber!: string;

  @Column({ name: 'remarks', type: 'text', nullable: true, comment: '备注' })
  remarks!: string;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序' })
  sortOrder!: number;

  @Column({ name: 'status', type: 'tinyint', default: 1, comment: '状态: 1-启用, 0-禁用' })
  status!: number;

  @Column({ name: 'is_del', type: 'tinyint', default: 0 })
  isDel!: number;
}
