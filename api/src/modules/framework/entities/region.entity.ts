import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 地区实体
 */
@Entity('region')
@Index(['parentId'])
@Index(['level'])
@Index(['adCode'])
export class Region {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '0', comment: '父级ID，0表示顶级' })
  parentId: string;

  @Column({ nullable: true, comment: '行政区划代码' })
  adCode: string;

  @Column({ nullable: true, comment: '城市编码' })
  cityCode: string;

  @Column({ nullable: true, comment: '中心点坐标（经度,纬度）' })
  center: string;

  @Column({ comment: '级别：province-省，city-市，district-区县，street-街道' })
  level: string;

  @Column({ comment: '地区名称' })
  name: string;

  @Column({ nullable: true, comment: '路径，如：1,11,111' })
  path: string;

  @Column({ type: 'int', default: 0, comment: '排序序号' })
  orderNum: number;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;
}
