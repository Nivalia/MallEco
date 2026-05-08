import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import {
  WebSocketEvents,
  WebSocketRooms,
  WebSocketConfig,
  SocketClientInfo,
} from './websocket.config';

/**
 * WebSocket 网关
 */
@WebSocketGateway({
  path: WebSocketConfig.path,
  cors: {
    origin: WebSocketConfig.corsOrigins,
  },
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppGateway.name);
  private clients: Map<string, SocketClientInfo> = new Map();

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    const clientInfo: SocketClientInfo = {
      id: client.id,
      roles: [],
      rooms: [],
      connectedAt: new Date(),
    };
    this.clients.set(client.id, clientInfo);
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.clients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * 认证
   */
  @SubscribeMessage(WebSocketEvents.AUTH)
  handleAuth(client: Socket, payload: { token: string }) {
    // 验证token逻辑
    // 简化示例
    const clientInfo = this.clients.get(client.id);
    if (clientInfo) {
      clientInfo.userId = payload.token;
      clientInfo.roles.push('user');
      client.join(WebSocketRooms.BUYER);
      clientInfo.rooms.push(WebSocketRooms.BUYER);
    }
    client.emit(WebSocketEvents.AUTH_SUCCESS, { userId: payload.token });
  }

  /**
   * 加入房间
   */
  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, payload: { room: string }) {
    client.join(payload.room);
    const clientInfo = this.clients.get(client.id);
    if (clientInfo) {
      clientInfo.rooms.push(payload.room);
    }
    return { event: 'joined', room: payload.room };
  }

  /**
   * 离开房间
   */
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, payload: { room: string }) {
    client.leave(payload.room);
    const clientInfo = this.clients.get(client.id);
    if (clientInfo) {
      clientInfo.rooms = clientInfo.rooms.filter(r => r !== payload.room);
    }
    return { event: 'left', room: payload.room };
  }

  /**
   * 发送消息给指定用户
   */
  sendToUser(userId: string, event: string, data: any): void {
    for (const [clientId, clientInfo] of this.clients) {
      if (clientInfo.userId === userId) {
        this.server.to(clientId).emit(event, data);
      }
    }
  }

  /**
   * 发送消息给房间
   */
  sendToRoom(room: string, event: string, data: any): void {
    this.server.to(room).emit(event, data);
  }

  /**
   * 广播消息
   */
  broadcast(event: string, data: any): void {
    this.server.emit(event, data);
  }

  /**
   * 获取在线用户数
   */
  getOnlineCount(): number {
    return this.clients.size;
  }

  /**
   * 获取房间人数
   */
  getRoomCount(room: string): number {
    const roomClients = this.server.sockets.adapter.rooms.get(room);
    return roomClients ? roomClients.size : 0;
  }
}
