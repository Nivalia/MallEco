import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { ENTITY_OPTIONS } from '../../../common/entities/base.entity';

export enum ActivityStatus {
  DRAFT = 0,
  ACTIVE = 1,
  ENDED = 2,
}

export enum ActivityType {
  FULL_REDUCE = 0,
  DISCOUNT = 1,
  SECKILL = 2,
}

@Entity('mall_activity', ENTITY_OPTIONS)
@Index(['activityType'])
@Index(['status'])
@Index(['startTime', 'endTime'])
export class Activity {
  @Column({ type: 'bigint', primary: true, generated: 'increment' })
  id: string;

  @Column({ name: 'activity_name' })
  activityName: string;

  @Column({ name: 'activity_type', type: 'tinyint', default: ActivityType.FULL_REDUCE })
  activityType: number;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'start_time', type: 'datetime' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime' })
  endTime: Date;

  @Column({ name: 'status', type: 'tinyint', default: ActivityStatus.DRAFT })
  status: number;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'rules', type: 'json', nullable: true })
  rules: Record<string, any>;

  @Column({ name: 'is_top', type: 'tinyint', default: 0 })
  isTop: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
