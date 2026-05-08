import { Module, Global } from '@nestjs/common';
import { AdvancedLoggerService } from './advanced-logger.service';
import { LoggingController } from './logging.controller';

/**
 * 日志模块
 * 管理所有日志相关的服务和控制器
 */
@Global()
@Module({
  controllers: [LoggingController],
  providers: [AdvancedLoggerService],
  exports: [AdvancedLoggerService],
})
export class LoggingModule {}
