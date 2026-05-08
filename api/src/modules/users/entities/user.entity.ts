import {
  Entity,
  Column,
  Index,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { SocialAuthEntity } from '../../../social/entities/social-auth.entity';
import { ENTITY_OPTIONS } from '../../../common/entities/base.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

@Entity('mall_user', ENTITY_OPTIONS)
@Index(['username'])
@Index(['email'])
@Index(['phone'])
@Index(['nickname'])
export class User {
  @Column({ type: 'bigint', primary: true, generated: 'increment' })
  id: string;

  @Column({ name: 'username', unique: true })
  username: string;

  @Column({ name: 'password', nullable: true, select: false })
  password: string;

  @Column({ name: 'email', nullable: true })
  email: string;

  @Column({ name: 'phone', nullable: true })
  phone: string;

  @Column({ name: 'nickname', nullable: true })
  nickname: string;

  @Column({ name: 'avatar', nullable: true })
  avatar: string;

  @Column({ name: 'status', type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ name: 'last_login_time', type: 'datetime', nullable: true })
  lastLoginTime: Date;

  @Column({ name: 'last_login_ip', nullable: true })
  lastLoginIp: string;

  @Column({ name: 'gender', nullable: true })
  gender: string;

  @Column({ name: 'birthday', type: 'date', nullable: true })
  birthday: Date;

  @Column({ name: 'location', nullable: true })
  location: string;

  @Column({ name: 'is_vip', type: 'tinyint', default: 0 })
  isVip: number;

  @Column({ name: 'vip_expire_time', type: 'datetime', nullable: true })
  vipExpireTime: Date;

  @Column({ name: 'points', type: 'int', default: 0 })
  points: number;

  @Column({ name: 'balance', type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @Column({ name: 'is_del', type: 'tinyint', default: 0 })
  isDel: number;

  @OneToMany(() => SocialAuthEntity, socialAuth => socialAuth.user)
  socialAuths: SocialAuthEntity[];
}
