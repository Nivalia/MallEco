import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { ENTITY_OPTIONS } from '../../../common/entities/base.entity';

export enum CouponStatus {
  DRAFT = 0,
  ACTIVE = 1,
  ENDED = 2,
}

export enum CouponType {
  FULL_REDUCE = 0,
  DISCOUNT = 1,
  FREE_SHIPPING = 2,
}

export enum ApplicableRange {
  ALL = 0,
  SPECIFIC_PRODUCTS = 1,
  SPECIFIC_CATEGORIES = 2,
}

@Entity('mall_coupon', ENTITY_OPTIONS)
@Index(['status'])
@Index(['startTime', 'endTime'])
export class Coupon {
  @Column({ type: 'bigint', primary: true, generated: 'increment' })
  id: string;

  @Column({ name: 'coupon_name' })
  couponName: string;

  @Column({ name: 'coupon_type', type: 'tinyint', default: CouponType.FULL_REDUCE })
  couponType: number;

  @Column({ name: 'total_count', type: 'int', default: 0 })
  totalCount: number;

  @Column({ name: 'used_count', type: 'int', default: 0 })
  usedCount: number;

  @Column({ name: 'min_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  minAmount: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'discount_rate', type: 'decimal', precision: 3, scale: 1, default: 10 })
  discountRate: number;

  @Column({ name: 'start_time', type: 'datetime' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime' })
  endTime: Date;

  @Column({ name: 'status', type: 'tinyint', default: CouponStatus.DRAFT })
  status: number;

  @Column({ name: 'is_reusable', type: 'tinyint', default: 0 })
  isReusable: number;

  @Column({ name: 'applicable_range', type: 'tinyint', default: ApplicableRange.ALL })
  applicableRange: number;

  @Column({ name: 'applicable_ids', nullable: true })
  applicableIds: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
