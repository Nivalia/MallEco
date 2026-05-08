import { Controller, Get, Request, Response } from '@nestjs/common';
import { MonitoringService } from '../services/monitoring.service';
import { Logger } from '@nestjs/common';

@Controller('api')
export class MonitoringController {
  private readonly logger = new Logger(MonitoringController.name);

  constructor(private readonly monitoringService: MonitoringService) {}

  /**
   * 健康检查端点
   * @returns 健康检查结果
   */
  @Get('health')
  async healthCheck() {
    this.logger.debug('Health check requested');
    return this.monitoringService.getHealthStatus();
  }

  /**
   * 监控指标端点
   * @returns 监控指标
   */
  @Get('metrics')
  async getMetrics() {
    this.logger.debug('Metrics requested');
    return this.monitoringService.getMetrics();
  }

  /**
   * 应用信息端点
   * @returns 应用信息
   */
  @Get('info')
  async getInfo() {
    this.logger.debug('Application info requested');
    return this.monitoringService.getApplicationInfo();
  }

  /**
   * 系统状态端点
   * @returns 系统状态
   */
  @Get('status')
  async getStatus() {
    this.logger.debug('System status requested');
    return this.monitoringService.getSystemStatus();
  }
}
