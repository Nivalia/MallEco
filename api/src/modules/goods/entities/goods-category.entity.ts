import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('mall_goods_category')
export class GoodsCategory extends BaseEntity {
  @Column({ name: 'category_name', nullable: false, comment: '分类名称' })
  categoryName: string;

  @Column({ name: 'parent_id', nullable: false, default: 0, comment: '父分类ID' })
  parentId: string;

  @Column({ name: 'level', nullable: false, default: 1, comment: '分类级别' })
  level: number;

  @Column({ name: 'sort_order', nullable: false, default: 0, comment: '排序' })
  sortOrder: number;

  @Column({ name: 'is_show', nullable: false, default: 1, comment: '是否显示：0-不显示，1-显示' })
  isShow: number;

  @Column({ name: 'icon', nullable: true, comment: '分类图标' })
  icon: string;

  @Column({ name: 'is_delete', nullable: false, default: 0, comment: '是否删除：0-否，1-是' })
  isDelete: number;
}
