import { Global, Module } from '@nestjs/common';
import { DesensitizeService } from './desensitize.service';

/**
 * 数据脱敏模块
 *
 * 使用方法:
 * import { DesensitizeModule } from '@shared/security/desensitize.module';
 *
 * @Module({
 *   imports: [DesensitizeModule],
 * })
 */
@Global()
@Module({
  providers: [DesensitizeService],
  exports: [DesensitizeService],
})
export class DesensitizeModule {}
