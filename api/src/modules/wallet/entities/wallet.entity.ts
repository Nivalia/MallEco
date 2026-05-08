import {
  Entity,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('mall_wallet')
@Index(['userId'], { unique: true })
@Index(['balance'])
@Index(['frozenAmount'])
export class Wallet extends BaseEntity {
  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @Column({ name: 'balance', type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  balance: number;

  @Column({ name: 'frozen_amount', type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  frozenAmount: number;

  @Column({ name: 'total_income', type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  totalIncome: number;

  @Column({ name: 'total_expense', type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  totalExpense: number;

  @Column({ name: 'last_operate_time', type: 'datetime', nullable: true })
  lastOperateTime: Date;

  @Column({ name: 'last_operate_desc', nullable: true })
  lastOperateDesc: string;

  @Column({ name: 'create_time', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createTime: Date;

  @Column({ name: 'update_time', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updateTime: Date;

  @Column({ name: 'is_del', type: 'tinyint', default: 0 })
  isDel: number;
}
