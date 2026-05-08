import { Logger } from '@nestjs/common';
import { spawn } from 'child_process';

const logger = new Logger('DatabaseInit');

export async function initializeDatabase() {
  try {
    logger.log('🔍 开始数据库初始化检查...');

    // 直接返回成功，让应用先启动，数据库初始化可以在后台进行
    // 避免数据库初始化阻塞应用启动
    logger.log('✅ 应用启动中，数据库将在后台初始化...');

    // 启动后台进程进行数据库初始化
    const dbInitProcess = spawn('node', ['DB/database-manager.js', 'init'], {
      cwd: process.cwd(),
      detached: true,
      stdio: 'ignore',
    });

    dbInitProcess.unref();

    return true;
  } catch (error) {
    logger.error(
      `❌ 数据库初始化过程中发生错误: ${error instanceof Error ? error.message : String(error)}`,
    );
    // 即使数据库初始化失败，也允许应用启动
    return true;
  }
}
