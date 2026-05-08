import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Role } from './role.entity';
import { Department } from './department.entity';
import { UserRole } from './user-role.entity';

@Entity('rbac_users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'real_name', nullable: true })
  realName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: 1 })
  status: number; // 1-正常 2-禁用 3-锁定

  @Column({ default: 0 })
  gender: number; // 0-未知 1-男 2-女

  @Column({ name: 'last_login_ip', nullable: true })
  lastLoginIp: string;

  @Column({ name: 'last_login_time', nullable: true })
  lastLoginTime: Date;

  @Column({ name: 'login_count', default: 0 })
  loginCount: number;

  @Column({ name: 'department_id', nullable: true })
  departmentId: number;

  @ManyToOne(() => Department, department => department.users)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToMany(() => UserRole, userRole => userRole.user)
  userRoles: UserRole[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', nullable: true })
  createdBy: number;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: number;

  @Column({ name: 'remark', type: 'text', nullable: true })
  remark: string;
}
