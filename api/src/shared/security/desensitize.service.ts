import { Injectable } from '@nestjs/common';
import {
  DesensitizeRule,
  DesensitizeType,
  DesensitizeHandlers,
  DefaultDesensitizeRules,
} from './desensitize.config';

/**
 * 数据脱敏服务
 */
@Injectable()
export class DesensitizeService {
  private rules: DesensitizeRule[] = DefaultDesensitizeRules;

  /**
   * 设置脱敏规则
   */
  setRules(rules: DesensitizeRule[]): void {
    this.rules = rules;
  }

  /**
   * 添加脱敏规则
   */
  addRule(rule: DesensitizeRule): void {
    this.rules.push(rule);
  }

  /**
   * 脱敏单个值
   */
  desensitize(value: string, type: DesensitizeType): string {
    if (!value) return '';
    const handler = DesensitizeHandlers[type];
    return handler ? handler(value) : value;
  }

  /**
   * 脱敏对象
   */
  desensitizeObject<T extends Record<string, any>>(obj: T): T {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const result: any = { ...obj };

    for (const rule of this.rules) {
      if (result[rule.field] !== undefined && result[rule.field] !== null) {
        const value = String(result[rule.field]);
        result[rule.field] = rule.customHandler
          ? rule.customHandler(value)
          : this.desensitize(value, rule.type);
      }
    }

    return result;
  }

  /**
   * 脱敏数组
   */
  desensitizeArray<T extends Record<string, any>>(arr: T[]): T[] {
    if (!Array.isArray(arr)) {
      return arr;
    }
    return arr.map(item => this.desensitizeObject(item));
  }

  /**
   * 脱敏分页数据
   */
  desensitizePaginated<T extends Record<string, any>>(data: {
    data: T[];
    total: number;
  }): { data: T[]; total: number } {
    return {
      data: this.desensitizeArray(data.data),
      total: data.total,
    };
  }

  /**
   * 脱敏响应数据
   */
  desensitizeResponse<T>(response: T): T {
    if (!response) return response;

    if (Array.isArray(response)) {
      return this.desensitizeArray(response) as T;
    }

    if (typeof response === 'object') {
      return this.desensitizeObject(response as Record<string, any>) as T;
    }

    return response;
  }

  /**
   * 根据字段名自动匹配脱敏
   */
  autoDesensitize(value: string, fieldName: string): string {
    const fieldLower = fieldName.toLowerCase();

    if (
      fieldLower.includes('phone') ||
      fieldLower.includes('mobile') ||
      fieldLower.includes('tel')
    ) {
      return this.desensitize(value, DesensitizeType.PHONE);
    }

    if (fieldLower.includes('email')) {
      return this.desensitize(value, DesensitizeType.EMAIL);
    }

    if (
      fieldLower.includes('idcard') ||
      fieldLower.includes('id_card') ||
      fieldLower.includes('id_number')
    ) {
      return this.desensitize(value, DesensitizeType.ID_CARD);
    }

    if (fieldLower.includes('bankcard') || fieldLower.includes('bank_card')) {
      return this.desensitize(value, DesensitizeType.BANK_CARD);
    }

    if (fieldLower.includes('name') && !fieldLower.includes('file')) {
      return this.desensitize(value, DesensitizeType.NAME);
    }

    if (fieldLower.includes('address')) {
      return this.desensitize(value, DesensitizeType.ADDRESS);
    }

    if (fieldLower.includes('password') || fieldLower.includes('pwd')) {
      return this.desensitize(value, DesensitizeType.PASSWORD);
    }

    return value;
  }
}
