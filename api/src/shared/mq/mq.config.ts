/**
 * 消息队列配置
 */
export interface MqConfig {
  /**
   * 是否启用
   */
  enabled: boolean;

  /**
   * 默认交换机
   */
  defaultExchange: string;

  /**
   * 默认队列
   */
  defaultQueue: string;

  /**
   * 消息类型
   */
  messageTypes: {
    /**
     * 订单消息
     */
    ORDER: 'order';

    /**
     * 支付消息
     */
    PAYMENT: 'payment';

    /**
     * 库存消息
     */
    STOCK: 'stock';

    /**
     * 通知消息
     */
    NOTIFICATION: 'notification';

    /**
     * 日志消息
     */
    LOG: 'log';
  };
}

export const MqConfig: MqConfig = {
  enabled: true,
  defaultExchange: 'mallEco',
  defaultQueue: 'mallEcoQueue',
  messageTypes: {
    ORDER: 'order',
    PAYMENT: 'payment',
    STOCK: 'stock',
    NOTIFICATION: 'notification',
    LOG: 'log',
  },
};

/**
 * 消息格式
 */
export interface Message<T = any> {
  /**
   * 消息 ID
   */
  id: string;

  /**
   * 消息类型
   */
  type: string;

  /**
   * 业务类型
   */
  businessType: string;

  /**
   * 负载数据
   */
  payload: T;

  /**
   * 创建时间
   */
  timestamp: number;

  /**
   * 重试次数
   */
  retryCount: number;

  /**
   * 额外数据
   */
  extras?: Record<string, any>;
}

/**
 * 消息状态
 */
export enum MessageStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  DEAD = 'dead',
}

/**
 * 消息发送选项
 */
export interface PublishOptions {
  /**
   * 消息类型
   */
  type: string;

  /**
   * 业务类型
   */
  businessType: string;

  /**
   * 是否持久化
   */
  persistent?: boolean;

  /**
   * 过期时间(毫秒)
   */
  expiration?: number;

  /**
   * 延迟发送(毫秒)
   */
  delay?: number;
}
