import { registerAs } from '@nestjs/config';
import { IsString, IsNotEmpty, MinLength, IsEnum } from 'class-validator';

/**
 * JWT算法枚举
 */
export enum JwtAlgorithm {
  HS256 = 'HS256',
  HS384 = 'HS384',
  HS512 = 'HS512',
}

/**
 * JWT配置接口
 */
export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
  algorithm: JwtAlgorithm;
  audience: string;
  issuer: string;
  ignoreExpiration: boolean;
  validateIssuer: boolean;
  validateAudience: boolean;
  clockTolerance: number;
  blacklistEnabled: boolean;
  blacklistTtl: number;
}

/**
 * JWT配置验证类
 */
export class JwtConfigValidation {
  @IsString()
  @IsNotEmpty()
  @MinLength(32, { message: 'JWT_SECRET长度至少32个字符' })
  secret!: string;

  @IsString()
  @IsNotEmpty()
  expiresIn!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(32, { message: 'JWT_REFRESH_SECRET长度至少32个字符' })
  refreshSecret!: string;

  @IsString()
  @IsNotEmpty()
  refreshExpiresIn!: string;

  @IsEnum(JwtAlgorithm)
  algorithm!: JwtAlgorithm;

  @IsString()
  @IsNotEmpty()
  audience!: string;

  @IsString()
  @IsNotEmpty()
  issuer!: string;
}

/**
 * JWT配置
 */
export default registerAs<JwtConfig>('jwt', () => {
  const secret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  // 验证JWT_SECRET是否设置
  if (!secret) {
    throw new Error('❌ 错误: 未设置JWT_SECRET环境变量');
  }

  // 验证JWT_SECRET长度
  if (secret.length < 32) {
    throw new Error('❌ 错误: JWT_SECRET长度至少32个字符');
  }

  // 验证JWT_REFRESH_SECRET是否设置
  if (!refreshSecret) {
    throw new Error('❌ 错误: 未设置JWT_REFRESH_SECRET环境变量');
  }

  // 验证JWT_REFRESH_SECRET长度
  if (refreshSecret.length < 32) {
    throw new Error('❌ 错误: JWT_REFRESH_SECRET长度至少32个字符');
  }

  return {
    secret,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h', // 缩短访问令牌过期时间
    refreshSecret,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // 缩短刷新令牌过期时间
    algorithm: (process.env.JWT_ALGORITHM as JwtAlgorithm) || JwtAlgorithm.HS512, // 使用更安全的算法
    audience: process.env.JWT_AUDIENCE || 'mall-eco-api',
    issuer: process.env.JWT_ISSUER || 'mall-eco',
    ignoreExpiration: false,
    validateIssuer: true,
    validateAudience: true,
    clockTolerance: 60, // 允许60秒的时钟偏差
    blacklistEnabled: true,
    blacklistTtl: 60 * 60 * 24 * 7, // 黑名单TTL为7天
  };
});
