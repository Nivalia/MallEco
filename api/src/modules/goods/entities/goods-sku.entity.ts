import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Goods } from './goods.entity';

@Entity('mall_goods_sku')
@Index(['goodsId'])
export class GoodsSku extends BaseEntity {
  @Column({ name: 'goods_id', nullable: false, comment: '商品ID' })
  goodsId: string;

  @ManyToOne(() => Goods, goods => goods.skuList)
  @JoinColumn({ name: 'goods_id' })
  goods: Goods;

  @Column({ name: 'sku_sn', nullable: false, unique: true, comment: '规格编号' })
  skuSn: string;

  @Column({ name: 'spec_value', type: 'json', nullable: false, comment: '规格值' })
  specValue: Record<string, string>;

  @Column({
    name: 'price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '规格价格',
  })
  price: number;

  @Column({ name: 'stock', type: 'int', nullable: false, default: 0, comment: '规格库存' })
  stock: number;

  @Column({ name: 'sku_img', nullable: true, comment: '规格图片' })
  skuImg: string;

  @Column({ name: 'is_delete', nullable: false, default: 0, comment: '是否删除：0-否，1-是' })
  isDelete: number;
}
