import { Global, Module } from '@nestjs/common';
import { MqService } from './mq.service';

/**
 * 消息队列模块
 *
 * 使用方法:
 * import { MqModule } from '@shared/mq/mq.module';
 *
 * @Module({
 *   imports: [MqModule],
 * })
 */
@Global()
@Module({
  providers: [MqService],
  exports: [MqService],
})
export class MqModule {}
