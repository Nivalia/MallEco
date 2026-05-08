import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreRootController } from './controllers/store-root.controller';
import { StoreService } from './store.service';

@Module({
  controllers: [StoreController, StoreRootController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}
