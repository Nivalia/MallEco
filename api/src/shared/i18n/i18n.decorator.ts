import { SetMetadata } from '@nestjs/common';
import { I18nService } from './i18n.service';

export const I18N_KEY = 'i18n';

/**
 * 多语言装饰器
 *
 * 使用方法:
 * @Get('hello')
 * @I18n('zh-CN')
 * hello() { }
 */
export const I18n = (locale?: string) => SetMetadata(I18N_KEY, locale);

/**
 * i18n 模块
 */
export { I18nService } from './i18n.service';
export { I18nConfig, SupportedLocale, LocaleNames } from './i18n.config';

/**
 * 快速翻译辅助函数
 */
export function createI18nTranslator(i18nService: I18nService) {
  return (key: string, params?: Record<string, string | number>, locale?: string) => {
    return i18nService.translate(key, params, locale);
  };
}
