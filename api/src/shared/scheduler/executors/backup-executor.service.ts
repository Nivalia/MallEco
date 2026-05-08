import { Injectable, Logger } from '@nestjs/common';
import { DelayTaskExecutor } from '../interfaces/executor.interface';
import { TimeTriggerMsg } from '../interfaces/time-trigger.interface';
import { BackupService } from '../../backup/backup.service';

/**
 * 数据备份任务执行器
 * 用于定时执行数据库备份任务
 */
@Injectable()
export class BackupExecutorService implements DelayTaskExecutor {
  readonly executorName = 'DATABASE_BACKUP';
  private readonly logger = new Logger(BackupExecutorService.name);

  constructor(private readonly backupService: BackupService) {}

  /**
   * 执行数据库备份任务
   */
  async execute(msg: TimeTriggerMsg): Promise<void> {
    this.logger.log('Starting scheduled database backup', { service: 'BackupExecutor' });

    try {
      // 执行备份
      await this.backupService.createBackup();

      // 清理过期备份
      await this.backupService.cleanExpiredBackups();

      this.logger.log('Scheduled database backup completed successfully', {
        service: 'BackupExecutor',
      });
    } catch (error) {
      this.logger.error('Failed to execute scheduled database backup', error, {
        service: 'BackupExecutor',
      });
      throw error;
    }
  }
}
