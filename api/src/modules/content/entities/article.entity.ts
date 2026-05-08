import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { Category } from './category.entity';
import { Tag } from './tag.entity';
import { ENTITY_OPTIONS } from '../../../common/entities/base.entity';

export enum ArticleStatus {
  DRAFT = 0,
  PUBLISHED = 1,
  ARCHIVED = 2,
}

@Entity('mall_article', ENTITY_OPTIONS)
@Index(['status'])
@Index(['publishTime'])
export class Article {
  @Column({ type: 'bigint', primary: true, generated: 'increment' })
  id: string;

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'sub_title', nullable: true })
  subTitle: string;

  @Column({ name: 'content', type: 'longtext' })
  content: string;

  @Column({ name: 'summary', type: 'text', nullable: true })
  summary: string;

  @Column({ name: 'cover_image', nullable: true })
  coverImage: string;

  @Column({ name: 'author', nullable: true })
  author: string;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @Column({ name: 'like_count', type: 'int', default: 0 })
  likeCount: number;

  @Column({ name: 'comment_count', type: 'int', default: 0 })
  commentCount: number;

  @Column({ name: 'status', type: 'tinyint', default: ArticleStatus.DRAFT })
  status: number;

  @Column({ name: 'is_top', type: 'tinyint', default: 0 })
  isTop: number;

  @Column({ name: 'is_hot', type: 'tinyint', default: 0 })
  isHot: number;

  @Column({ name: 'publish_time', type: 'datetime', nullable: true })
  publishTime: Date;

  @Column({ name: 'category_id', type: 'bigint', nullable: true })
  categoryId: string;

  @ManyToOne(() => Category, category => category.articles, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: Category;

  @ManyToMany(() => Tag)
  @JoinTable({ name: 'mall_article_tag' })
  tags: Tag[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
