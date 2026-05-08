import { SetMetadata } from '@nestjs/common';

export const API_VERSION_KEY = 'apiVersion';

/**
 * API 版本装饰器
 *
 * 使用方法:
 * @Controller('users')
 * @ApiVersion('v1')
 * export class UserControllerV1 {}
 *
 * @Controller('users')
 * @ApiVersion('v2')
 * export class UserControllerV2 {}
 */
export const ApiVersion = (version: string) => SetMetadata(API_VERSION_KEY, version);

/**
 * API 版本枚举
 */
export enum ApiVersionEnum {
  V1 = 'v1',
  V2 = 'v2',
  V3 = 'v3',
}

/**
 * 默认版本配置
 */
export const DEFAULT_API_VERSION = ApiVersionEnum.V1;

/**
 * 支持的版本列表
 */
export const SUPPORTED_API_VERSIONS = [ApiVersionEnum.V1, ApiVersionEnum.V2, ApiVersionEnum.V3];

/**
 * 获取版本对应的URL前缀
 */
export function getVersionPrefix(version: string): string {
  return `/${version}`;
}
