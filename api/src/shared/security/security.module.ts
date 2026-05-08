import { Module, Global } from '@nestjs/common';
import { CircuitBreakerService } from './circuit-breaker.service';

/**
 * 安全模块
 * 管理所有安全相关的服务
 */
@Global()
@Module({
  providers: [CircuitBreakerService],
  exports: [CircuitBreakerService],
})
export class SecurityModule {}
