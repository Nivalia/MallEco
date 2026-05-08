import { Module, Global } from '@nestjs/common';
import { AppGateway } from './websocket.gateway';

/**
 * WebSocket 模块
 *
 * 使用方法:
 * import { WebSocketModule } from '@shared/websocket/websocket.module';
 *
 * @Module({
 *   imports: [WebSocketModule],
 * })
 */
@Global()
@Module({
  providers: [AppGateway],
  exports: [AppGateway],
})
export class WebSocketModule {}
