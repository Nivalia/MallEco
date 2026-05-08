import { Global, Module } from '@nestjs/common';
import { LockService } from './lock.service';

/**
 * 分布式锁模块
 *
 * 使用方法:
 * import { LockModule } from '@shared/lock/lock.module';
 *
 * @Module({
 *   imports: [LockModule],
 * })
 */
@Global()
@Module({
  providers: [LockService],
  exports: [LockService],
})
export class LockModule {}
