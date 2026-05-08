import { Module } from '@nestjs/common';
import { OtherController } from './other.controller';
import { OtherRootController } from './controllers/other-root.controller';
import { OtherService } from './other.service';

@Module({
  controllers: [OtherController, OtherRootController],
  providers: [OtherService],
  exports: [OtherService],
})
export class OtherModule {}
