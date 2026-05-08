import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RateLimiterService } from './rate-limiter.service';
import { Request } from 'express';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly rateLimiterService: RateLimiterService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();

    const identifier = this.getClientIdentifier(request);
    const apiPath = request.route?.path || request.path;
    const config = this.getRateLimitConfig(apiPath);
    const result = await this.rateLimiterService.checkApiRateLimit(apiPath, identifier, config);

    this.setRateLimitHeaders(response, result);

    if (!result.allowed) {
      throw new HttpException(
        config.message || '请求过于频繁，请稍后再试',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private getClientIdentifier(request: Request): string {
    if (request.user && (request.user as any).id) {
      return `user:${(request.user as any).id}`;
    }

    const ip = this.getClientIp(request);
    return `ip:${ip}`;
  }

  private getClientIp(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      return Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0].trim();
    }

    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    return request.ip || 'unknown';
  }

  private getRateLimitConfig(apiPath: string): any {
    const predefinedConfigs = this.rateLimiterService.getPredefinedConfigs();

    if (apiPath.includes('/auth/login')) {
      return predefinedConfigs.login;
    }

    if (apiPath.includes('/auth/register')) {
      return predefinedConfigs.register;
    }

    if (apiPath.includes('/sms') || apiPath.includes('/captcha')) {
      return predefinedConfigs.sms;
    }

    return predefinedConfigs.api;
  }

  private setRateLimitHeaders(response: any, result: any): void {
    // 使用类型断言来确保setHeader方法的安全调用
    const res = response as { setHeader: (name: string, value: string | number) => void };
    res.setHeader('X-RateLimit-Limit', result.maxRequests || 60);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));
  }
}

// 定义装饰器函数中this的类型
interface RateLimitThisContext {
  rateLimiterService?: RateLimiterService;
  moduleRef?: { get: <T>(type: any) => T };
  getClientIdentifier?: (request: any) => string;
}

export function RateLimit(config?: any) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (this: RateLimitThisContext, ...args: any[]) {
      const request = args[0]?.req || args[0];
      let rateLimiterService = this.rateLimiterService;
      if (!rateLimiterService && this.moduleRef) {
        rateLimiterService = this.moduleRef.get(RateLimiterService);
      }

      if (rateLimiterService && request) {
        let identifier = 'unknown';
        if (this.getClientIdentifier) {
          identifier = this.getClientIdentifier(request);
        }
        const apiPath = request.route?.path || request.path;

        const result = await rateLimiterService.checkApiRateLimit(apiPath, identifier, config);

        if (!result.allowed) {
          throw new HttpException(
            config?.message || '请求过于频繁，请稍后再试',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
      }

      // 使用更具体的函数类型定义来替代Function类型
      const func = originalMethod as (...args: any[]) => Promise<any>;
      return func.apply(this, args);
    };

    return descriptor;
  };
}
