import { Injectable } from '@nestjs/common';

interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  successCount: number;
  lastFailureTime: number;
  lastStateChangeTime: number;
  timeout: number;
}

interface CircuitBreakerConfig {
  failureThreshold: number; // 失败阈值
  successThreshold: number; // 成功阈值
  timeout: number; // 超时时间（毫秒）
  resetTimeout: number; // 重置超时时间（毫秒）
}

@Injectable()
export class CircuitBreakerService {
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private defaultConfig: CircuitBreakerConfig = {
    failureThreshold: 5, // 5次失败后打开断路器
    successThreshold: 3, // 3次成功后关闭断路器
    timeout: 5000, // 5秒超时
    resetTimeout: 30000, // 30秒后尝试半开状态
  };

  /**
   * 检查断路器状态
   */
  checkCircuitBreaker(key: string, config?: Partial<CircuitBreakerConfig>): boolean {
    const finalConfig = { ...this.defaultConfig, ...config };
    const state = this.getOrCreateState(key, finalConfig);

    switch (state.state) {
      case 'CLOSED':
        return true;
      case 'OPEN':
        // 检查是否已经过了重置时间
        if (Date.now() - state.lastStateChangeTime > finalConfig.resetTimeout) {
          // 进入半开状态
          this.transitionState(key, 'HALF_OPEN', finalConfig);
          return true;
        }
        return false;
      case 'HALF_OPEN':
        return true;
      default:
        return true;
    }
  }

  /**
   * 记录成功事件
   */
  recordSuccess(key: string, config?: Partial<CircuitBreakerConfig>) {
    const finalConfig = { ...this.defaultConfig, ...config };
    const state = this.getOrCreateState(key, finalConfig);

    switch (state.state) {
      case 'CLOSED':
        // 重置失败计数
        state.failureCount = 0;
        break;
      case 'HALF_OPEN':
        // 增加成功计数
        state.successCount++;
        if (state.successCount >= finalConfig.successThreshold) {
          // 成功阈值达到，关闭断路器
          this.transitionState(key, 'CLOSED', finalConfig);
        }
        break;
      case 'OPEN':
        // 忽略成功，因为断路器是打开状态
        break;
    }
  }

  /**
   * 记录失败事件
   */
  recordFailure(key: string, config?: Partial<CircuitBreakerConfig>) {
    const finalConfig = { ...this.defaultConfig, ...config };
    const state = this.getOrCreateState(key, finalConfig);

    state.failureCount++;
    state.lastFailureTime = Date.now();

    switch (state.state) {
      case 'CLOSED':
        // 检查是否达到失败阈值
        if (state.failureCount >= finalConfig.failureThreshold) {
          // 打开断路器
          this.transitionState(key, 'OPEN', finalConfig);
        }
        break;
      case 'HALF_OPEN':
        // 半开状态下失败，重新打开断路器
        this.transitionState(key, 'OPEN', finalConfig);
        break;
      case 'OPEN':
        // 断路器已经打开，更新失败时间
        break;
    }
  }

  /**
   * 获取或创建断路器状态
   */
  private getOrCreateState(key: string, config: CircuitBreakerConfig): CircuitBreakerState {
    if (!this.circuitBreakers.has(key)) {
      this.circuitBreakers.set(key, {
        state: 'CLOSED',
        failureCount: 0,
        successCount: 0,
        lastFailureTime: 0,
        lastStateChangeTime: Date.now(),
        timeout: config.timeout,
      });
    }
    return this.circuitBreakers.get(key);
  }

  /**
   * 转换断路器状态
   */
  private transitionState(
    key: string,
    newState: 'CLOSED' | 'OPEN' | 'HALF_OPEN',
    config: CircuitBreakerConfig,
  ) {
    const state = this.getOrCreateState(key, config);
    state.state = newState;
    state.lastStateChangeTime = Date.now();

    // 重置计数
    if (newState === 'CLOSED') {
      state.failureCount = 0;
      state.successCount = 0;
    } else if (newState === 'HALF_OPEN') {
      state.successCount = 0;
      state.failureCount = 0;
    }
  }

  /**
   * 获取断路器状态
   */
  getCircuitBreakerState(key: string): CircuitBreakerState | undefined {
    return this.circuitBreakers.get(key);
  }

  /**
   * 重置断路器
   */
  resetCircuitBreaker(key: string, config?: Partial<CircuitBreakerConfig>) {
    const finalConfig = { ...this.defaultConfig, ...config };
    this.circuitBreakers.set(key, {
      state: 'CLOSED',
      failureCount: 0,
      successCount: 0,
      lastFailureTime: 0,
      lastStateChangeTime: Date.now(),
      timeout: finalConfig.timeout,
    });
  }

  /**
   * 获取所有断路器状态
   */
  getAllCircuitBreakerStates(): Map<string, CircuitBreakerState> {
    return this.circuitBreakers;
  }
}
