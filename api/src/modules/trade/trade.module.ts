import { Module } from '@nestjs/common';
import { TradeController } from './trade.controller';
import { TradeRootController } from './controllers/trade-root.controller';
import { TradeService } from './trade.service';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';

@Module({
  controllers: [TradeController, CartsController, TradeRootController],
  providers: [TradeService, CartsService],
  exports: [TradeService, CartsService],
})
export class TradeModule {}
