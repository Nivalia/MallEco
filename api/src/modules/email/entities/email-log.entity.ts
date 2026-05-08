import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { ENTITY_OPTIONS } from '../../../common/entities/base.entity';

export enum EmailStatus {
  FAILED = 0,
  SUCCESS = 1,
}

export enum EmailType {
  VERIFY = 1,
  NOTICE = 2,
  MARKETING = 3,
}

@Entity('mall_email_log', ENTITY_OPTIONS)
@Index(['toEmail'])
@Index(['status'])
export class EmailLog {
  @Column({ type: 'bigint', primary: true, generated: 'increment' })
  id: string;

  @Column({ name: 'to_email' })
  toEmail: string;

  @Column({ name: 'subject' })
  subject: string;

  @Column({ name: 'content', type: 'text', nullable: true })
  content: string;

  @Column({ name: 'email_type', type: 'tinyint', default: EmailType.NOTICE })
  emailType: number;

  @Column({ name: 'business_type' })
  businessType: string;

  @Column({ name: 'business_id', type: 'bigint', nullable: true })
  businessId: string;

  @Column({ name: 'status', type: 'tinyint', default: EmailStatus.FAILED })
  status: number;

  @Column({ name: 'error_msg', nullable: true })
  errorMsg: string;

  @Column({ name: 'send_time', type: 'datetime', nullable: true })
  sendTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
