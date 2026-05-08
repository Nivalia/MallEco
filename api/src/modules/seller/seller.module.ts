import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoodsController } from './controllers/goods/goods.controller';
import { CategoryController } from './controllers/goods/category.controller';
import { OrderController } from './controllers/order/order.controller';
import { PromotionController } from './controllers/promotion/promotion.controller';
import { StoreSettingController } from './controllers/settings/store.controller';
import { SellerDashboardController } from './controllers/statistics/dashboard.controller';
import { SellerController } from './controllers/seller.controller';
import { GoodsService } from './services/goods/goods.service';
import { CategoryService } from './services/goods/category.service';
import { OrderService } from './services/order/order.service';
import { PromotionService } from './services/promotion/promotion.service';
import { StoreSettingService } from './services/settings/store.service';
import { StatisticsModule } from '../statistics/statistics.module';

@Module({
  imports: [ConfigModule, StatisticsModule],
  controllers: [
    SellerController,
    GoodsController,
    CategoryController,
    OrderController,
    PromotionController,
    StoreSettingController,
    SellerDashboardController,
  ],
  providers: [GoodsService, CategoryService, OrderService, PromotionService, StoreSettingService],
  exports: [],
})
export class SellerModule {}
