import { Controller, Get, Query, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AdvancedLoggerService } from './advanced-logger.service';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';

@ApiTags('日志管理')
@Controller('api/logger')
@UseGuards(AdminAuthGuard) // 只有管理员可以访问日志管理API
export class LoggingController {
  constructor(private readonly loggerService: AdvancedLoggerService) {}

  @Get('stats')
  @ApiOperation({ summary: '获取日志统计信息' })
  @ApiResponse({ status: HttpStatus.OK, description: '成功获取日志统计信息' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: '未授权' })
  async getLogStats() {
    return this.loggerService.getLogStats();
  }

  @Get('search')
  @ApiOperation({ summary: '搜索日志' })
  @ApiQuery({ name: 'query', description: '搜索关键词', required: false })
  @ApiQuery({ name: 'level', description: '日志级别', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间 (ISO格式)', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间 (ISO格式)', required: false })
  @ApiQuery({ name: 'limit', description: '返回数量限制', required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: '成功搜索日志' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: '未授权' })
  async searchLogs(
    @Query('query') query?: string,
    @Query('level') level?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
    @Query('limit') limit: number = 100,
  ) {
    const start = startTime ? new Date(startTime) : undefined;
    const end = endTime ? new Date(endTime) : undefined;

    return this.loggerService.searchLogs(query, level, start, end, limit);
  }

  @Get('health')
  @ApiOperation({ summary: '日志系统健康检查' })
  @ApiResponse({ status: HttpStatus.OK, description: '成功获取健康状态' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: '未授权' })
  async healthCheck() {
    return this.loggerService.healthCheck();
  }

  @Post('cleanup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '清理旧日志' })
  @ApiQuery({ name: 'daysToKeep', description: '保留天数', required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: '成功清理旧日志' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: '未授权' })
  async cleanupOldLogs(@Query('daysToKeep') daysToKeep: number = 30) {
    return this.loggerService.cleanupOldLogs(daysToKeep);
  }
}
