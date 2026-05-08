import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ExternalIntegrationService } from '../services/external-integration.service';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../infrastructure/auth/guards/roles.guard';
import { Roles } from '../../../infrastructure/auth/decorators/roles.decorator';

@Controller('insurance/external-integration')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExternalIntegrationController {
  constructor(private readonly externalIntegrationService: ExternalIntegrationService) {}

  /**
   * 验证外部系统连接
   * @returns 连接状态
   */
  @Get('health')
  @Roles('admin', 'insurance_manager')
  validateConnection() {
    return this.externalIntegrationService.validateExternalSystemConnection();
  }

  /**
   * 获取外部系统配置信息
   * @returns 配置信息
   */
  @Get('config')
  @Roles('admin')
  getExternalSystemConfig() {
    return this.externalIntegrationService.getExternalSystemConfig();
  }

  /**
   * 从外部系统获取理赔状态
   * @param claimNumber 理赔单号
   * @returns 理赔状态信息
   */
  @Get('claims/:claimNumber/status')
  @Roles('admin', 'insurance_manager', 'insurance_staff')
  getClaimStatusFromExternalSystem(@Param('claimNumber') claimNumber: string) {
    return this.externalIntegrationService.getClaimStatusFromExternalSystem(claimNumber);
  }

  /**
   * 批量同步保单到外部系统
   * @param policyIds 保单ID列表
   * @returns 同步结果统计
   */
  @Post('policies/batch-sync')
  @Roles('admin', 'insurance_manager')
  batchSyncPolicies(@Body('policyIds') policyIds: string[]) {
    // 注意：这里需要根据实际情况实现，可能需要先查询保单列表
    // 暂时返回一个示例响应
    return {
      message: '批量同步功能待实现',
      policyIds,
    };
  }
}
