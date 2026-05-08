import {
  Entity,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ENTITY_OPTIONS } from '../../../common/entities/base.entity';

export enum DistributorStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
  FROZEN = 3,
}

export enum DistributorLevel {
  NORMAL = 0,
  SENIOR = 1,
  TOP = 2,
}

@Entity('mall_distributor', ENTITY_OPTIONS)
@Index(['userId'], { unique: true })
export class Distributor {
  @Column({ type: 'bigint', primary: true, generated: 'increment' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'distributor_name' })
  distributorName: string;

  @Column({ name: 'distributor_level', type: 'tinyint', default: DistributorLevel.NORMAL })
  distributorLevel: number;

  @Column({ name: 'inviter_id', type: 'bigint', nullable: true })
  inviterId: string;

  @Column({ name: 'total_sales', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalSales: number;

  @Column({ name: 'total_commission', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalCommission: number;

  @Column({ name: 'available_commission', type: 'decimal', precision: 15, scale: 2, default: 0 })
  availableCommission: number;

  @Column({ name: 'frozen_commission', type: 'decimal', precision: 15, scale: 2, default: 0 })
  frozenCommission: number;

  @Column({ name: 'status', type: 'tinyint', default: DistributorStatus.PENDING })
  status: number;

  @Column({ name: 'audit_time', type: 'datetime', nullable: true })
  auditTime: Date;

  @Column({ name: 'audit_note', nullable: true })
  auditNote: string;

  @Column({ name: 'invite_code', unique: true })
  inviteCode: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
