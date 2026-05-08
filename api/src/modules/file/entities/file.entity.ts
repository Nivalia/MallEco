import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { ENTITY_OPTIONS } from '../../../common/entities/base.entity';

@Entity('mall_file', ENTITY_OPTIONS)
@Index(['businessType', 'businessId'])
@Index(['uploaderId'])
export class MallFile {
  @Column({ type: 'bigint', primary: true, generated: 'increment' })
  id: string;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'file_url' })
  fileUrl: string;

  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: number;

  @Column({ name: 'file_type', nullable: true })
  fileType: string;

  @Column({ name: 'mime_type', nullable: true })
  mimeType: string;

  @Column({ name: 'storage_type', default: 'local' })
  storageType: string;

  @Column({ name: 'business_type', nullable: true })
  businessType: string;

  @Column({ name: 'business_id', type: 'bigint', nullable: true })
  businessId: string;

  @Column({ name: 'uploader_id', type: 'bigint', nullable: true })
  uploaderId: string;

  @Column({ name: 'uploader_name', nullable: true })
  uploaderName: string;

  @Column({ name: 'status', type: 'tinyint', default: 1 })
  status: number;

  @Column({ name: 'md5', nullable: true })
  md5: string;

  @Column({ name: 'sha1', nullable: true })
  sha1: string;

  @Column({ name: 'upload_time', type: 'datetime', nullable: true })
  uploadTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
