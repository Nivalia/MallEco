import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Goods } from './entities/goods.entity';
import { GoodsSku } from './entities/goods-sku.entity';
import { GoodsCategory } from './entities/goods-category.entity';
import { GoodsFullController } from './controllers/goods-full.controller';
import { GoodsFullService } from './services/goods-full.service';
import { GoodsController } from './goods.controller';
import { GoodsService } from './goods.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [TypeOrmModule.forFeature([Goods, GoodsSku, GoodsCategory]), CacheModule],
  controllers: [GoodsFullController, GoodsController],
  providers: [GoodsFullService, GoodsService],
  exports: [GoodsFullService, GoodsService],
})
export class GoodsModule {}
