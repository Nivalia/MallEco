import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { ENTITY_OPTIONS } from '../../../common/entities/base.entity';

@Entity('mall_logistics', ENTITY_OPTIONS)
@Index(['code'], { unique: true })
export class MallLogistics {
  @Column({ type: 'bigint', primary: true, generated: 'increment' })
  id: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'code' })
  code: string;

  @Column({ name: 'plugin_name' })
  pluginName: string;

  @Column({ name: 'stand_by', default: 'N' })
  standBy: string;

  @Column({ name: 'form_items', type: 'text', nullable: true })
  formItems: string;

  @Column({ name: 'disabled', default: 'OPEN' })
  disabled: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
