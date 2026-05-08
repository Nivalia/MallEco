import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ENTITY_OPTIONS } from '../../../common/entities/base.entity';

export enum AnnouncementType {
  SYSTEM = 'system',
  ACTIVITY = 'activity',
  NOTICE = 'notice',
}

export enum AnnouncementStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('announcement', ENTITY_OPTIONS)
export class Announcement {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @Column({ name: 'type', type: 'enum', enum: AnnouncementType, default: AnnouncementType.NOTICE })
  type: AnnouncementType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AnnouncementStatus,
    default: AnnouncementStatus.DRAFT,
  })
  status: AnnouncementStatus;

  @Column({ name: 'priority', type: 'int', default: 0 })
  priority: number;

  @Column({ name: 'cover_image', nullable: true })
  coverImage: string;

  @Column({ name: 'publish_time', type: 'datetime', nullable: true })
  publishTime: Date;

  @Column({ name: 'expire_time', type: 'datetime', nullable: true })
  expireTime: Date;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @Column({ name: 'is_top', type: 'tinyint', default: 0 })
  isTop: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
