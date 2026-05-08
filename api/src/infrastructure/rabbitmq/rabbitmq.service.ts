import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { timeout } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private client: ClientProxy | null = null;
  private readonly logger = new Logger(RabbitMQService.name);
  private readonly isEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isEnabled = this.configService.get<boolean>('RABBITMQ_ENABLED', false);
  }

  /**
   * 模块初始化时执行
   */
  async onModuleInit() {
    if (this.isEnabled) {
      this.logger.log('Initializing RabbitMQ service...');
      // 预创建客户端连接
      await this.ensureClientConnected();
    }
  }

  /**
   * 模块销毁时执行
   */
  async onModuleDestroy() {
    if (this.client) {
      this.logger.log('Closing RabbitMQ connection...');
      await this.close();
    }
  }

  /**
   * 确保客户端已连接
   */
  private async ensureClientConnected(): Promise<void> {
    const client = this.getClient();
    if (client) {
      try {
        await client.connect();
        this.logger.log('RabbitMQ client connected successfully');
      } catch (error) {
        this.logger.error('Failed to connect to RabbitMQ:', error);
      }
    }
  }

  /**
   * 获取或创建ClientProxy实例
   * @returns ClientProxy实例
   */
  private getClient(): ClientProxy | null {
    if (!this.isEnabled) {
      this.logger.debug('RabbitMQ is disabled');
      return null;
    }

    if (!this.client) {
      try {
        // 获取RabbitMQ配置
        const urls = this.configService
          .get<string>('RABBITMQ_URLS', 'amqp://localhost:5672')
          .split(',');
        const queue = this.configService.get<string>('RABBITMQ_QUEUE', 'mall_eco_queue');
        const exchange = this.configService.get<string>('RABBITMQ_EXCHANGE', 'mall_eco_exchange');
        const exchangeType = this.configService.get<string>('RABBITMQ_EXCHANGE_TYPE', 'topic');
        const routingKey = this.configService.get<string>('RABBITMQ_ROUTING_KEY', '#');
        const prefetchCount = this.configService.get<number>('RABBITMQ_PREFETCH_COUNT', 10);
        const heartbeat = this.configService.get<number>('RABBITMQ_HEARTBEAT', 60);
        const reconnectInterval = this.configService.get<number>(
          'RABBITMQ_RECONNECT_INTERVAL',
          5000,
        );
        const reconnectAttempts = this.configService.get<number>('RABBITMQ_RECONNECT_ATTEMPTS', 10);

        this.client = ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: urls.map(url => url.trim()),
            queue,
            queueOptions: {
              durable: true,
              autoDelete: false,
              exclusive: false,
              maxLength: this.configService.get<number>('RABBITMQ_QUEUE_MAX_LENGTH', 10000),
              messageTtl: this.configService.get<number>('RABBITMQ_MESSAGE_TTL', 86400000), // 24小时
            },
          },
        });

        this.logger.log(`RabbitMQ client created with queue: ${queue}`);
      } catch (error) {
        this.logger.error('Failed to create RabbitMQ client:', error);
        return null;
      }
    }
    return this.client;
  }

  /**
   * 发送消息到RabbitMQ（请求-响应模式）
   * @param pattern 消息模式
   * @param data 消息数据
   * @param timeout 超时时间（毫秒）
   * @returns Promise<any>
   */
  async send<T>(pattern: string, data: any, timeoutMs: number = 30000): Promise<T> {
    const client = this.getClient();
    if (!client) {
      this.logger.warn('RabbitMQ client is not available, skipping send operation');
      return null as any;
    }

    try {
      this.logger.debug(`Sending message to RabbitMQ: ${pattern}`);
      const result = await client.send<T>(pattern, data).pipe(timeout(timeoutMs)).toPromise();
      this.logger.debug(`Received response from RabbitMQ: ${pattern}`);
      return result as T;
    } catch (error) {
      this.logger.error(`Failed to send message to RabbitMQ (${pattern}):`, error);
      // 可以在这里添加消息重试逻辑
      throw error;
    }
  }

  /**
   * 发布消息到RabbitMQ（发布-订阅模式）
   * @param pattern 消息模式
   * @param data 消息数据
   */
  async emit(pattern: string, data: any): Promise<void> {
    const client = this.getClient();
    if (!client) {
      this.logger.warn('RabbitMQ client is not available, skipping emit operation');
      return;
    }

    try {
      this.logger.debug(`Emitting message to RabbitMQ: ${pattern}`);
      await client.emit(pattern, data).toPromise();
      this.logger.debug(`Message emitted successfully: ${pattern}`);
    } catch (error) {
      this.logger.error(`Failed to emit message to RabbitMQ (${pattern}):`, error);
      // 记录错误并继续执行
    }
  }

  /**
   * 发送消息到指定队列
   * @param queue 队列名称
   * @param data 消息数据
   */
  async sendToQueue(queue: string, data: any): Promise<void> {
    const client = this.getClient();
    if (!client) {
      this.logger.warn('RabbitMQ client is not available, skipping sendToQueue operation');
      return;
    }

    try {
      this.logger.debug(`Sending message to queue: ${queue}`);
      // 使用队列名称作为pattern
      await client.emit(queue, data).toPromise();
      this.logger.debug(`Message sent to queue successfully: ${queue}`);
    } catch (error) {
      this.logger.error(`Failed to send message to queue (${queue}):`, error);
    }
  }

  /**
   * 声明队列
   * @param queue 队列名称
   * @param options 队列选项
   */
  async assertQueue(queue: string): Promise<void> {
    // 注意：NestJS的ClientProxy不直接支持队列声明
    // 这里可以使用底层的amqp库实现，或者通过发送特殊消息来触发
    this.logger.debug(`Asserting queue: ${queue}`);
  }

  /**
   * 断开RabbitMQ连接
   */
  async close(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
        this.logger.log('RabbitMQ connection closed successfully');
      } catch (error) {
        this.logger.error('Failed to close RabbitMQ connection:', error);
      } finally {
        this.client = null;
      }
    }
  }

  /**
   * 检查RabbitMQ连接状态
   * @returns 连接状态
   */
  async checkConnection(): Promise<boolean> {
    try {
      const client = this.getClient();
      if (!client) {
        return false;
      }

      // 发送一个测试消息来检查连接
      await client.connect();
      return true;
    } catch (error) {
      this.logger.error('RabbitMQ connection check failed:', error);
      return false;
    }
  }

  /**
   * 获取RabbitMQ配置信息
   * @returns 配置信息
   */
  getConfigInfo(): any {
    return {
      enabled: this.isEnabled,
      urls: this.configService.get<string>('RABBITMQ_URLS', 'amqp://localhost:5672').split(','),
      queue: this.configService.get<string>('RABBITMQ_QUEUE', 'mall_eco_queue'),
      exchange: this.configService.get<string>('RABBITMQ_EXCHANGE', 'mall_eco_exchange'),
    };
  }
}
