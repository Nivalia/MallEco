import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@infrastructure/auth/guards/roles.guard';
import { Roles } from '@infrastructure/auth/decorators/roles.decorator';
import { ExpiryReminderService } from '../services/expiry-reminder.service';

@ApiTags('到期提醒管理')
@Controller('expiry-reminders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpiryReminderController {
  constructor(private readonly expiryReminderService: ExpiryReminderService) {}

  @Get('expiring-policies')
  @ApiOperation({ summary: '获取即将到期的保单' })
  @ApiResponse({ status: 200, description: '获取即将到期的保单成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @Roles('admin', 'insurance_staff')
  async getExpiringPolicies(@Query('days') days: number = 30) {
    return await this.expiryReminderService.getExpiringPolicies(days);
  }

  @Get('generate')
  @ApiOperation({ summary: '生成到期提醒' })
  @ApiResponse({ status: 200, description: '生成到期提醒成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @Roles('admin', 'insurance_staff')
  async generateExpiryReminders(@Query('days') days: number = 30) {
    return await this.expiryReminderService.generateExpiryReminders(days);
  }

  @Get('send/:policyId')
  @ApiOperation({ summary: '发送单个保单的到期提醒' })
  @ApiResponse({ status: 200, description: '发送到期提醒成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '保单不存在' })
  @Roles('admin', 'insurance_staff')
  async sendExpiryReminder(@Param('policyId') policyId: string) {
    return await this.expiryReminderService.sendExpiryReminder(policyId);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取到期提醒统计' })
  @ApiResponse({ status: 200, description: '获取到期提醒统计成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @Roles('admin', 'insurance_staff')
  async getExpiryReminderStatistics(@Query('days') days: number = 30) {
    return await this.expiryReminderService.getExpiryReminderStatistics(days);
  }
}
