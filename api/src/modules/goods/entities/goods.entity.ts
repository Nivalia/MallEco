import {
  Entity,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { GoodsSku } from './goods-sku.entity';
import { ENTITY_OPTIONS } from '../../../common/entities/base.entity';

@Entity('mall_goods', ENTITY_OPTIONS)
@Index(['goodsName'])
@Index(['goodsSn'])
@Index(['categoryId'])
export class Goods {
  @Column({ type: 'bigint', primary: true, generated: 'increment' })
  id: string;

  @Column({ name: 'goods_name' })
  goodsName: string;

  @Column({ name: 'goods_sn', unique: true })
  goodsSn: string;

  @Column({ name: 'category_id', type: 'bigint' })
  categoryId: string;

  @Column({ name: 'brand_id', type: 'bigint', nullable: true })
  brandId: string;

  @Column({ name: 'goods_weight', type: 'decimal', precision: 10, scale: 2, default: 0 })
  goodsWeight: number;

  @Column({ name: 'market_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
  marketPrice: number;

  @Column({ name: 'shop_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
  shopPrice: number;

  @Column({ name: 'stock', type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'is_on_sale', type: 'tinyint', default: 0 })
  isOnSale: number;

  @Column({ name: 'is_delete', type: 'tinyint', default: 0 })
  isDelete: number;

  @Column({ name: 'goods_desc', type: 'text', nullable: true })
  goodsDesc: string;

  @Column({ name: 'goods_img', nullable: true })
  goodsImg: string;

  @Column({ name: 'goods_gallery', type: 'json', nullable: true })
  goodsGallery: string[];

  @Column({ name: 'keywords', nullable: true })
  keywords: string;

  @Column({ name: 'is_new', type: 'tinyint', default: 0 })
  isNew: number;

  @Column({ name: 'is_hot', type: 'tinyint', default: 0 })
  isHot: number;

  @Column({ name: 'sales_num', type: 'int', default: 0 })
  salesNum: number;

  @Column({ name: 'click_num', type: 'int', default: 0 })
  clickNum: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => GoodsSku, sku => sku.goods)
  skuList: GoodsSku[];
}
