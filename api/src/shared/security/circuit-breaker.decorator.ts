import { CircuitBreakerService } from './circuit-breaker.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

interface CircuitBreakerConfig {
  failureThreshold?: number;
  successThreshold?: number;
  timeout?: number;
  resetTimeout?: number;
  name?: string;
}

/**
 * 断路器装饰器
 * 用于为关键接口添加熔断保护
 */
export function CircuitBreaker(config: CircuitBreakerConfig = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value as (...args: any[]) => Promise<any>;
    let circuitBreakerService: CircuitBreakerService;

    interface Context {
      circuitBreakerService?: CircuitBreakerService;
      moduleRef?: {
        get: <T>(type: new (...args: any[]) => T) => T;
      };
    }

    // 初始化断路器服务
    descriptor.value = async function (this: Context, ...args: any[]) {
      // 延迟获取断路器服务，确保依赖注入完成
      if (!circuitBreakerService) {
        // 从应用上下文获取断路器服务
        circuitBreakerService =
          this.circuitBreakerService ||
          (this.moduleRef && this.moduleRef.get(CircuitBreakerService)) ||
          new CircuitBreakerService();
      }

      // 生成断路器键
      const serviceName = config.name || target.constructor.name;
      const methodName = propertyKey;
      const circuitKey = `${serviceName}:${methodName}`;

      // 检查断路器状态
      if (!circuitBreakerService.checkCircuitBreaker(circuitKey, config)) {
        throw new HttpException('服务暂时不可用，请稍后再试', HttpStatus.SERVICE_UNAVAILABLE);
      }

      let timer: NodeJS.Timeout;

      try {
        // 设置超时
        const timeoutPromise = new Promise((_, reject) => {
          timer = setTimeout(() => {
            reject(new HttpException('服务响应超时', HttpStatus.GATEWAY_TIMEOUT));
          }, config.timeout || 5000);
        });

        // 执行原始方法，设置超时保护
        const result = await Promise.race([originalMethod.apply(this, args), timeoutPromise]);

        // 清除超时计时器
        clearTimeout(timer);

        // 记录成功
        circuitBreakerService.recordSuccess(circuitKey, config);

        return result;
      } catch (error) {
        // 清除超时计时器
        clearTimeout(timer);

        // 记录失败
        circuitBreakerService.recordFailure(circuitKey, config);

        // 重新抛出错误
        throw error;
      }
    };

    return descriptor;
  };
}
