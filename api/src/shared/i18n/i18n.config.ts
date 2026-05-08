/**
 * 国际化配置
 */
export interface I18nConfig {
  /**
   * 默认语言
   */
  defaultLocale: string;

  /**
   * 是否启用
   */
  enabled: boolean;

  /**
   * 语言映射
   */
  locales: Record<string, string>;
}

/**
 * 支持的语言
 */
export enum SupportedLocale {
  ZH_CN = 'zh-CN',
  ZH_TW = 'zh-TW',
  EN_US = 'en-US',
  JA_JP = 'ja-JP',
}

/**
 * 语言名称映射
 */
export const LocaleNames: Record<SupportedLocale, string> = {
  [SupportedLocale.ZH_CN]: '简体中文',
  [SupportedLocale.ZH_TW]: '繁體中文',
  [SupportedLocale.EN_US]: 'English',
  [SupportedLocale.JA_JP]: '日本語',
};

/**
 * 默认配置
 */
export const I18nConfig: I18nConfig = {
  defaultLocale: SupportedLocale.ZH_CN,
  enabled: true,
  locales: {
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
    'en-US': 'English',
    'ja-JP': '日本語',
  },
};
