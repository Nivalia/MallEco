import { Global, Module } from '@nestjs/common';
import { I18nService } from './i18n.service';

/**
 * 国际化模块
 *
 * 使用方法:
 * import { I18nModule } from '@shared/i18n/i18n.module';
 *
 * @Module({
 *   imports: [I18nModule],
 * })
 */
@Global()
@Module({
  providers: [I18nService],
  exports: [I18nService],
})
export class I18nModule {}
