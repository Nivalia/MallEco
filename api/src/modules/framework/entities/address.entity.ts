import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('member_address')
export class MemberAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  memberId: string;

  @Column({ length: 50 })
  consignee: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 100 })
  province: string;

  @Column({ length: 100 })
  city: string;

  @Column({ nullable: true })
  district: string;

  @Column({ type: 'text' })
  detailAddress: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @Column({ default: false })
  deleted: boolean;
}
