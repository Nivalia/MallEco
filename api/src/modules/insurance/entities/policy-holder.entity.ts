import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';

@Entity('policy_holder')
@Index(['companyName'])
@Index(['holderName'])
@Index(['phone'])
export class PolicyHolder extends BaseEntity {
  @Column({ name: 'holder_type', type: 'tinyint', default: 1, comment: '类型: 1-公司, 2-个人' })
  holderType!: number;

  @Column({ name: 'company_name', nullable: true, comment: '公司名称' })
  companyName!: string;

  @Column({ name: 'license_plate', nullable: true, unique: true, comment: '车牌号' })
  licensePlate!: string;

  @Column({ name: 'holder_name', nullable: true, comment: '个人姓名' })
  holderName!: string;

  @Column({ name: 'contact_person', nullable: true, comment: '联系人' })
  contactPerson!: string;

  @Column({ name: 'phone', nullable: true, comment: '联系电话' })
  phone!: string;

  @Column({ name: 'email', nullable: true, comment: '邮箱' })
  email!: string;

  @Column({
    name: 'tax_number',

    nullable: true,
    unique: true,
    comment: '纳税人识别号',
  })
  taxNumber!: string;

  @Column({ name: 'address', nullable: true, comment: '地址' })
  address!: string;

  @Column({ name: 'bank_account', nullable: true, comment: '银行账号' })
  bankAccount!: string;

  @Column({ name: 'bank_name', nullable: true, comment: '开户行' })
  bankName!: string;

  @Column({ name: 'status', type: 'tinyint', default: 1, comment: '状态: 1-正常, 0-停用' })
  status!: number;

  @Column({ name: 'is_del', type: 'tinyint', default: 0 })
  isDel!: number;
}
