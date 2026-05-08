import { Injectable, Logger } from '@nestjs/common';
import { MqConfig, Message, PublishOptions, MessageStatus } from './mq.config';
import { v4 as uuidv4 } from 'uuid';

interface MessageOptions {
  type?: string;
  businessType?: string;
  [key: string]: any;
}

/**
 * 消息队列服务
 */
@Injectable()
export class MqService {
  private readonly logger = new Logger(MqService.name);

  /**
   * 创建消息
   */
  createMessage<T>(payload: T, options: MessageOptions): Message<T> {
    return {
      id: uuidv4(),
      type: options.type || 'default',
      businessType: options.businessType || 'default',
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      extras: options as any,
    };
  }

  /**
   * 发送消息
   */
  async publish<T>(message: Message<T>): Promise<void> {
    if (!MqConfig.enabled) {
      this.logger.warn('Message queue is disabled');
      return;
    }

    this.logger.debug(`Publishing message: ${message.id}`);
    // 实际实现应该调用 RabbitMQ 或其他消息队列
  }

  /**
   * 发送延迟消息
   */
  async publishDelay<T>(message: Message<T>, delay: number): Promise<void> {
    if (!MqConfig.enabled) {
      this.logger.warn('Message queue is disabled');
      return;
    }

    this.logger.debug(`Publishing delayed message: ${message.id}, delay: ${delay}ms`);
    // 实际实现应该使用延迟队列
  }

  /**
   * 发送订单消息
   */
  async publishOrderMessage<T>(businessType: string, payload: T): Promise<void> {
    const message = this.createMessage(payload, {
      type: MqConfig.messageTypes.ORDER,
      businessType,
      persistent: true,
    });
    await this.publish(message);
  }

  /**
   * 发送支付消息
   */
  async publishPaymentMessage<T>(businessType: string, payload: T): Promise<void> {
    const message = this.createMessage(payload, {
      type: MqConfig.messageTypes.PAYMENT,
      businessType,
      persistent: true,
    });
    await this.publish(message);
  }

  /**
   * 发送库存消息
   */
  async publishStockMessage<T>(businessType: string, payload: T): Promise<void> {
    const message = this.createMessage(payload, {
      type: MqConfig.messageTypes.STOCK,
      businessType,
      persistent: true,
    });
    await this.publish(message);
  }

  /**
   * 发送通知消息
   */
  async publishNotificationMessage<T>(businessType: string, payload: T): Promise<void> {
    const message = this.createMessage(payload, {
      type: MqConfig.messageTypes.NOTIFICATION,
      businessType,
      persistent: true,
    });
    await this.publish(message);
  }

  /**
   * 批量发送消息
   */
  async publishBatch<T>(messages: Message<T>[]): Promise<void> {
    if (!MqConfig.enabled) {
      return;
    }

    for (const message of messages) {
      await this.publish(message);
    }
  }

  /**
   * 构建消息Key
   */
  buildRoutingKey(type: string, businessType: string): string {
    return `${MqConfig.defaultExchange}.${type}.${businessType}`;
  }
}
