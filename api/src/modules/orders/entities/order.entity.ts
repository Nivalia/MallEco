import {
  Column,
  Entity,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { ENTITY_OPTIONS } from '../../../common/entities/base.entity';

@Entity('mall_order', ENTITY_OPTIONS)
@Index(['orderSn'])
@Index(['userId'])
@Index(['status'])
export class Order {
  @Column({ type: 'bigint', primary: true, generated: 'increment' })
  id: string;

  @Column({ name: 'order_sn', unique: true })
  orderSn: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ name: 'pay_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  payAmount: number;

  @Column({ name: 'coupon_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  couponAmount: number;

  @Column({ name: 'shipping_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingFee: number;

  @Column({ name: 'pay_type', type: 'tinyint', default: 0 })
  payType: number;

  @Column({ name: 'status', type: 'tinyint', default: 0 })
  status: number;

  @Column({ name: 'shipping_name', nullable: true })
  shippingName: string;

  @Column({ name: 'shipping_code', nullable: true })
  shippingCode: string;

  @Column({ name: 'payment_time', type: 'datetime', nullable: true })
  paymentTime: Date;

  @Column({ name: 'shipping_time', type: 'datetime', nullable: true })
  shippingTime: Date;

  @Column({ name: 'confirm_time', type: 'datetime', nullable: true })
  confirmTime: Date;

  @Column({ name: 'end_time', type: 'datetime', nullable: true })
  endTime: Date;

  @Column({ name: 'consignee' })
  consignee: string;

  @Column({ name: 'mobile' })
  mobile: string;

  @Column({ name: 'province', nullable: true })
  province: string;

  @Column({ name: 'city', nullable: true })
  city: string;

  @Column({ name: 'district', nullable: true })
  district: string;

  @Column({ name: 'address' })
  address: string;

  @Column({ name: 'zip_code', nullable: true })
  zipCode: string;

  @Column({ name: 'user_note', nullable: true })
  userNote: string;

  @Column({ name: 'admin_note', nullable: true })
  adminNote: string;

  @Column({ name: 'is_deleted', type: 'tinyint', default: 0 })
  isDeleted: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => OrderItem, orderItem => orderItem.orderId)
  items: OrderItem[];
}
