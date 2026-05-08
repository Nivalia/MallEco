import { Injectable } from '@nestjs/common';
import { ConfigManagerService } from '../config/config-manager.service';
import { AdvancedLoggerService } from '../../logging/advanced-logger.service';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly backupDir: string;
  private readonly dbConfig: any;

  constructor(
    private readonly configManager: ConfigManagerService,
    private readonly logger: AdvancedLoggerService,
  ) {
    this.dbConfig = this.configManager.getDatabaseConfig();
    this.backupDir = join(process.cwd(), 'backups');

    // 确保备份目录存在
    if (!existsSync(this.backupDir)) {
      mkdirSync(this.backupDir, { recursive: true });
      this.logger.info(`Backup directory created: ${this.backupDir}`, { service: 'BackupService' });
    }
  }

  /**
   * 创建数据库备份
   * @param backupName 备份名称（可选，默认使用时间戳）
   * @returns 备份文件路径
   */
  async createBackup(backupName?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = backupName || `backup-${timestamp}.sql`;
    const backupPath = join(this.backupDir, filename);

    try {
      this.logger.info(`Starting database backup to ${backupPath}`, { service: 'BackupService' });

      // 构建mysqldump命令
      const cmd = [
        'mysqldump',
        `-h ${this.dbConfig.host}`,
        `-P ${this.dbConfig.port}`,
        `-u ${this.dbConfig.username}`,
        `${this.dbConfig.password ? `-p${this.dbConfig.password}` : ''}`,
        `--databases ${this.dbConfig.database}`,
        `--single-transaction`,
        `--quick`,
        `--lock-tables=false`,
        `> ${backupPath}`,
      ].join(' ');

      // 执行备份命令
      await execAsync(cmd);

      this.logger.info(`Database backup completed successfully: ${backupPath}`, {
        service: 'BackupService',
      });
      return backupPath;
    } catch (error) {
      this.logger.error('Failed to create database backup', {
        service: 'BackupService',
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * 恢复数据库备份
   * @param backupPath 备份文件路径
   * @returns 是否恢复成功
   */
  async restoreBackup(backupPath: string): Promise<boolean> {
    try {
      this.logger.info(`Starting database restore from ${backupPath}`, {
        service: 'BackupService',
      });

      // 构建mysql命令
      const cmd = [
        'mysql',
        `-h ${this.dbConfig.host}`,
        `-P ${this.dbConfig.port}`,
        `-u ${this.dbConfig.username}`,
        `${this.dbConfig.password ? `-p${this.dbConfig.password}` : ''}`,
        `--database ${this.dbConfig.database}`,
        `< ${backupPath}`,
      ].join(' ');

      // 执行恢复命令
      await execAsync(cmd);

      this.logger.info(`Database restore completed successfully from ${backupPath}`, {
        service: 'BackupService',
      });
      return true;
    } catch (error) {
      this.logger.error('Failed to restore database backup', {
        service: 'BackupService',
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * 获取备份文件列表
   * @returns 备份文件列表
   */
  async getBackupList(): Promise<
    Array<{ name: string; path: string; size: number; created: Date }>
  > {
    try {
      const { stdout } = await execAsync(`ls -la ${this.backupDir}`);
      const lines = stdout.split('\n').slice(1); // 跳过标题行

      const backupList: { name: string; path: string; size: number; created: Date }[] = [];
      for (const line of lines) {
        if (line.trim()) {
          const parts = line.split(/\s+/);
          if (parts.length >= 9) {
            const size = parseInt(parts[4]);
            const created = new Date(`${parts[5]} ${parts[6]} ${parts[7]}`);
            const name = parts[8];

            if (name.endsWith('.sql')) {
              backupList.push({
                name,
                path: join(this.backupDir, name),
                size,
                created,
              });
            }
          }
        }
      }

      // 按创建时间倒序排序
      backupList.sort((a, b) => b.created.getTime() - a.created.getTime());

      return backupList;
    } catch (error) {
      this.logger.error('Failed to get backup list', {
        service: 'BackupService',
        error: error.message,
      });
      return [];
    }
  }

  /**
   * 删除过期备份
   * @param days 保留天数
   * @returns 删除的备份数量
   */
  async cleanExpiredBackups(days: number = 7): Promise<number> {
    try {
      this.logger.info(`Cleaning backups older than ${days} days`, { service: 'BackupService' });

      const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
      const backups = await this.getBackupList();
      let deletedCount = 0;

      for (const backup of backups) {
        if (backup.created.getTime() < cutoffTime) {
          await execAsync(`rm ${backup.path}`);
          deletedCount++;
          this.logger.info(`Deleted expired backup: ${backup.name}`, { service: 'BackupService' });
        }
      }

      this.logger.info(`Cleaned ${deletedCount} expired backups`, { service: 'BackupService' });
      return deletedCount;
    } catch (error) {
      this.logger.error('Failed to clean expired backups', {
        service: 'BackupService',
        error: error.message,
      });
      return 0;
    }
  }
}
