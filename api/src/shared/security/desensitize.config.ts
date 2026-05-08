/**
 * 脱敏规则配置
 */
export interface DesensitizeRule {
  /**
   * 字段名
   */
  field: string;

  /**
   * 脱敏类型
   */
  type: DesensitizeType;

  /**
   * 自定义脱敏函数
   */
  customHandler?: (value: string) => string;
}

/**
 * 脱敏类型枚举
 */
export enum DesensitizeType {
  /**
   * 手机号
   */
  PHONE = 'PHONE',

  /**
   * 邮箱
   */
  EMAIL = 'EMAIL',

  /**
   * 身份证号
   */
  ID_CARD = 'ID_CARD',

  /**
   * 银行卡号
   */
  BANK_CARD = 'BANK_CARD',

  /**
   * 姓名
   */
  NAME = 'NAME',

  /**
   * 地址
   */
  ADDRESS = 'ADDRESS',

  /**
   * 密码
   */
  PASSWORD = 'PASSWORD',

  /**
   * 自定义
   */
  CUSTOM = 'CUSTOM',
}

/**
 * 脱敏处理函数映射
 */
export const DesensitizeHandlers: Record<DesensitizeType, (value: string) => string> = {
  /**
   * 手机号: 138****1234
   */
  [DesensitizeType.PHONE]: (value: string) => {
    if (!value) return '';
    return value.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  },

  /**
   * 邮箱: t***@example.com
   */
  [DesensitizeType.EMAIL]: (value: string) => {
    if (!value) return '';
    const parts = value.split('@');
    if (parts.length !== 2) return value;
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 2) return `${name[0]}***@${domain}`;
    return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
  },

  /**
   * 身份证: 110101****12345678
   */
  [DesensitizeType.ID_CARD]: (value: string) => {
    if (!value) return '';
    return value.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
  },

  /**
   * 银行卡: 6222 **** **** 1234
   */
  [DesensitizeType.BANK_CARD]: (value: string) => {
    if (!value) return '';
    return value.replace(/(\d{4})\d+(\d{4})/, '$1 **** **** $2');
  },

  /**
   * 姓名: 张*
   */
  [DesensitizeType.NAME]: (value: string) => {
    if (!value) return '';
    if (value.length === 1) return value;
    if (value.length === 2) return `${value[0]}*`;
    return `${value[0]}${'*'.repeat(value.length - 2)}${value[value.length - 1]}`;
  },

  /**
   * 地址: 北京市海淀区***
   */
  [DesensitizeType.ADDRESS]: (value: string) => {
    if (!value) return '';
    if (value.length <= 6) return value;
    return value.substring(0, 6) + '***';
  },

  /**
   * 密码: ******
   */
  [DesensitizeType.PASSWORD]: () => '******',

  /**
   * 自定义
   */
  [DesensitizeType.CUSTOM]: (value: string) => value,
};

/**
 * 默认脱敏配置
 */
export const DefaultDesensitizeRules: DesensitizeRule[] = [
  { field: 'phone', type: DesensitizeType.PHONE },
  { field: 'mobile', type: DesensitizeType.PHONE },
  { field: 'tel', type: DesensitizeType.PHONE },
  { field: 'email', type: DesensitizeType.EMAIL },
  { field: 'idCard', type: DesensitizeType.ID_CARD },
  { field: 'id_number', type: DesensitizeType.ID_CARD },
  { field: 'bankCard', type: DesensitizeType.BANK_CARD },
  { field: 'bank_card', type: DesensitizeType.BANK_CARD },
  { field: 'realName', type: DesensitizeType.NAME },
  { field: 'real_name', type: DesensitizeType.NAME },
  { field: 'name', type: DesensitizeType.NAME },
  { field: 'address', type: DesensitizeType.ADDRESS },
  { field: 'password', type: DesensitizeType.PASSWORD },
  { field: 'pwd', type: DesensitizeType.PASSWORD },
];
