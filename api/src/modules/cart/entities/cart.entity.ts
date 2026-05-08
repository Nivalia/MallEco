import {
  Entity,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ENTITY_OPTIONS } from '../../../common/entities/base.entity';

@Entity('mall_cart', ENTITY_OPTIONS)
@Index(['userId', 'productId'], { unique: true })
export class Cart {
  @Column({ type: 'bigint', primary: true, generated: 'increment' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'product_id', type: 'bigint' })
  productId: string;

  @Column({ name: 'quantity', type: 'int', default: 1 })
  quantity: number;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'discount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ name: 'product_name', nullable: true })
  productName: string;

  @Column({ name: 'product_image', nullable: true })
  productImage: string;

  @Column({ name: 'product_attributes', type: 'json', nullable: true })
  productAttributes: Record<string, any>;

  @Column({ name: 'selected', type: 'tinyint', default: 1 })
  selected: number;

  @Column({ name: 'is_deleted', type: 'tinyint', default: 0 })
  isDeleted: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
