import { Global, Module } from '@nestjs/common';
import { IdempotencyService } from './idempotency.service';

/**
 * 幂等性模块
 *
 * 使用方法:
 * import { IdempotencyModule } from '@shared/idempotency/idempotency.module';
 *
 * @Module({
 *   imports: [IdempotencyModule],
 * })
 */
@Global()
@Module({
  providers: [IdempotencyService],
  exports: [IdempotencyService],
})
export class IdempotencyModule {}
