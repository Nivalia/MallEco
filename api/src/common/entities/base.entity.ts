import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
} from 'typeorm';

/**
 * 基础实体 - 通用ID和时间戳
 * 使用自增ID，适用于大多数业务场景
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime' })
  deletedAt: Date;
}

/**
 * 带软删除的实体 - 包含isDeleted字段
 * 适用于需要显示标记删除的实体
 */
export abstract class BaseEntityWithSoftDelete {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime' })
  deletedAt: Date;

  @Column({ name: 'is_deleted', type: 'tinyint', default: 0 })
  isDeleted: number;
}

/**
 * UUID实体 - 使用UUID作为主键
 * 适用于分布式系统或需要全局唯一ID的场景
 */
export abstract class BaseUuidEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime' })
  deletedAt: Date;
}

/**
 * 通用实体选项配置
 */
export const ENTITY_OPTIONS = {
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  engine: 'InnoDB',
};

/**
 * 树形实体 - 支持父子层级关系
 * 适用于分类、组织等需要层级结构的场景
 */
export abstract class BaseTreeEntity extends BaseEntity {
  @Column({ name: 'parent_id', type: 'bigint', nullable: true, default: null })
  parentId: string | null;

  @Column({ name: 'level', type: 'int', default: 0 })
  level: number;

  @Column({ name: 'path', default: '' })
  path: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;
}

/**
 * 排序实体 - 包含排序字段
 */
export abstract class BaseSortableEntity extends BaseEntity {
  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'status', type: 'tinyint', default: 1 })
  status: number;
}
