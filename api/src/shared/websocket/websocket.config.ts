/**
 * WebSocket 事件名称
 */
export enum WebSocketEvents {
  // 连接事件
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',

  // 认证事件
  AUTH = 'auth',
  AUTH_SUCCESS = 'auth:success',
  AUTH_ERROR = 'auth:error',

  // 订单事件
  ORDER_CREATED = 'order:created',
  ORDER_PAID = 'order:paid',
  ORDER_SHIPPED = 'order:shipped',
  ORDER_COMPLETED = 'order:completed',
  ORDER_CANCELLED = 'order:cancelled',

  // 消息事件
  MESSAGE_NEW = 'message:new',
  MESSAGE_READ = 'message:read',

  // 通知事件
  NOTIFICATION_NEW = 'notification:new',

  // 实时状态
  USER_ONLINE = 'user:online',
  USER_OFFLINE = 'user:offline',

  // 通用事件
  PING = 'ping',
  PONG = 'pong',
}

/**
 * 消息类型
 */
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  VOICE = 'voice',
  VIDEO = 'video',
}

/**
 * WebSocket 房间
 */
export enum WebSocketRooms {
  // 系统
  SYSTEM = 'system',

  // 管理员
  ADMIN = 'admin',

  // 商家
  SELLER = 'seller',

  // 买家
  BUYER = 'buyer',

  // 客服
  CUSTOMER_SERVICE = 'customer_service',

  // 广播
  BROADCAST = 'broadcast',
}

/**
 * WebSocket 配置
 */
export interface WebSocketConfig {
  /**
   * 是否启用
   */
  enabled: boolean;

  /**
   * 路径
   */
  path: string;

  /**
   * 允许的origins
   */
  corsOrigins: string[];

  /**
   * 认证超时(ms)
   */
  authTimeout: number;

  /**
   * 心跳间隔(ms)
   */
  pingInterval: number;

  /**
   * 心跳超时(ms)
   */
  pingTimeout: number;
}

export const WebSocketConfig: WebSocketConfig = {
  enabled: true,
  path: '/ws',
  corsOrigins: ['*'],
  authTimeout: 10000,
  pingInterval: 30000,
  pingTimeout: 5000,
};

/**
 * 客户端信息
 */
export interface SocketClientInfo {
  id: string;
  userId?: string;
  username?: string;
  roles: string[];
  rooms: string[];
  ip?: string;
  connectedAt: Date;
}

/**
 * 消息格式
 */
export interface SocketMessage<T = any> {
  event: string;
  data: T;
  timestamp: number;
}
