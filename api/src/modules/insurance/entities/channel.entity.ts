import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';

@Entity('channel')
@Index(['channelName'])
@Index(['parentId'])
@Index(['status'])
@Index(['channelCode'])
@Index(['parentId', 'status'])
export class Channel extends BaseEntity {
  @Column({ name: 'channel_type', type: 'tinyint', default: 1, comment: '类型: 1-渠道, 2-业务员' })
  channelType!: number;

  @Column({ name: 'channel_code', unique: true, comment: '渠道编码' })
  channelCode!: string;

  @Column({ name: 'channel_name', comment: '渠道名称/业务员姓名' })
  channelName!: string;

  @Column({ name: 'parent_id', default: '0', comment: '上级渠道ID' })
  parentId!: string;

  @ManyToOne(() => Channel, channel => channel.id)
  @JoinColumn({ name: 'parent_id' })
  parent!: Channel;

  @Column({ name: 'contact_person', nullable: true, comment: '联系人' })
  contactPerson!: string;

  @Column({ name: 'contact_phone', nullable: true, comment: '联系电话' })
  contactPhone!: string;

  @Column({ name: 'email', nullable: true, comment: '邮箱' })
  email!: string;

  @Column({ name: 'id_card', nullable: true, comment: '身份证号(业务员)' })
  idCard!: string;

  @Column({ name: 'bank_account', nullable: true, comment: '银行账号' })
  bankAccount!: string;

  @Column({ name: 'bank_name', nullable: true, comment: '开户行' })
  bankName!: string;

  @Column({
    name: 'default_rate',
    type: 'decimal',
    precision: 5,
    scale: 4,
    default: 0.1,
    comment: '默认政策率',
  })
  defaultRate!: number;

  @Column({ name: 'tax_included_default', type: 'tinyint', default: 0, comment: '默认是否含税' })
  taxIncludedDefault!: number;

  @Column({ name: 'settlement_method', default: 'monthly', comment: '结算方式' })
  settlementMethod!: string;

  @Column({ name: 'address', nullable: true, comment: '地址' })
  address!: string;

  @Column({ name: 'status', type: 'tinyint', default: 1, comment: '状态: 1-正常, 0-停用' })
  status!: number;

  @Column({ name: 'is_del', type: 'tinyint', default: 0 })
  isDel!: number;
}
