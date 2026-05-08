import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';

@Entity('insurance_product_type')
@Index(['typeCode'])
@Index(['typeName'])
export class InsuranceProductType extends BaseEntity {
  @Column({ name: 'type_code', comment: '类型编码' })
  typeCode!: string;

  @Column({ name: 'type_name', comment: '类型名称' })
  typeName!: string;

  @Column({ name: 'description', nullable: true, comment: '类型描述' })
  description?: string;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序权重' })
  sortOrder!: number;

  @Column({ name: 'status', type: 'tinyint', default: 1, comment: '状态: 1-启用, 0-禁用' })
  status!: number;

  @Column({ name: 'is_del', type: 'tinyint', default: 0 })
  isDel!: number;
}
