import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderSn: string;

  @Column({ length: 100 })
  memberId: string;

  @Column({ nullable: true })
  storeId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  payAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  freightAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ default: 'UNPAID' })
  payStatus: string; // UNPAID, PAID, REFUNDED

  @Column({ default: 'PENDING' })
  orderStatus: string; // PENDING, CONFIRMED, SHIPPED, COMPLETED, CANCELLED

  @Column({ type: 'text', nullable: true })
  shippingAddress: string;

  @Column({ nullable: true })
  shippingName: string;

  @Column({ nullable: true })
  shippingPhone: string;

  @Column({ nullable: true })
  shippingCompany: string;

  @Column({ nullable: true })
  shippingNumber: string;

  @Column({ type: 'timestamp', nullable: true })
  payTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  shipTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  completeTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelTime: Date;

  @Column({ type: 'text', nullable: true })
  cancelReason: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @Column({ default: false })
  deleted: boolean;
}
