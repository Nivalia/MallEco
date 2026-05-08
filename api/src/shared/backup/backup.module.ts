import { Module, Global } from '@nestjs/common';
import { BackupService } from './backup.service';
import { AdvancedLoggerService } from '../../logging/advanced-logger.service';
import { ConfigManagerService } from '../config/config-manager.service';

/**
 * 数据备份模块
 */
@Global()
@Module({
  providers: [AdvancedLoggerService, ConfigManagerService, BackupService],
  exports: [BackupService],
})
export class BackupModule {}
