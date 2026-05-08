import { Controller, Get, Query } from '@nestjs/common';
import { InsuranceStatisticsService } from '../services/insurance-statistics.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('保险台账 - 统计分析')
@Controller('insurance/statistics')
export class InsuranceStatisticsController {
  constructor(private readonly statisticsService: InsuranceStatisticsService) {}

  @Get('business')
  @ApiOperation({ summary: '获取保险业务统计' })
  @ApiQuery({ name: 'startDate', type: Date, required: true, description: '开始日期' })
  @ApiQuery({ name: 'endDate', type: Date, required: true, description: '结束日期' })
  @ApiResponse({ status: 200, description: '获取业务统计成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async getBusinessStatistics(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return await this.statisticsService.getBusinessStatistics(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('premium-trend')
  @ApiOperation({ summary: '获取保费趋势分析' })
  @ApiQuery({
    name: 'period',
    enum: ['day', 'week', 'month', 'year'],
    required: true,
    description: '时间周期',
  })
  @ApiQuery({ name: 'startDate', type: Date, required: true, description: '开始日期' })
  @ApiQuery({ name: 'endDate', type: Date, required: true, description: '结束日期' })
  @ApiResponse({ status: 200, description: '获取保费趋势成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async getPremiumTrend(
    @Query('period') period: 'day' | 'week' | 'month' | 'year',
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return await this.statisticsService.getPremiumTrend(
      period,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('company-distribution')
  @ApiOperation({ summary: '获取保险公司分布' })
  @ApiQuery({ name: 'startDate', type: Date, required: true, description: '开始日期' })
  @ApiQuery({ name: 'endDate', type: Date, required: true, description: '结束日期' })
  @ApiResponse({ status: 200, description: '获取保险公司分布成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async getCompanyDistribution(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return await this.statisticsService.getCompanyDistribution(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('channel-distribution')
  @ApiOperation({ summary: '获取渠道分布' })
  @ApiQuery({ name: 'startDate', type: Date, required: true, description: '开始日期' })
  @ApiQuery({ name: 'endDate', type: Date, required: true, description: '结束日期' })
  @ApiResponse({ status: 200, description: '获取渠道分布成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async getChannelDistribution(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return await this.statisticsService.getChannelDistribution(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('settlement')
  @ApiOperation({ summary: '获取结算统计' })
  @ApiQuery({ name: 'startDate', type: Date, required: true, description: '开始日期' })
  @ApiQuery({ name: 'endDate', type: Date, required: true, description: '结束日期' })
  @ApiResponse({ status: 200, description: '获取结算统计成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async getSettlementStatistics(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return await this.statisticsService.getSettlementStatistics(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('claim')
  @ApiOperation({ summary: '获取理赔统计' })
  @ApiQuery({ name: 'startDate', type: Date, required: true, description: '开始日期' })
  @ApiQuery({ name: 'endDate', type: Date, required: true, description: '结束日期' })
  @ApiResponse({ status: 200, description: '获取理赔统计成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async getClaimStatistics(@Query('startDate') startDate: Date, @Query('endDate') endDate: Date) {
    return await this.statisticsService.getClaimStatistics(new Date(startDate), new Date(endDate));
  }

  @Get('claim-trend')
  @ApiOperation({ summary: '获取理赔趋势分析' })
  @ApiQuery({
    name: 'period',
    enum: ['day', 'week', 'month', 'year'],
    required: true,
    description: '时间周期',
  })
  @ApiQuery({ name: 'startDate', type: Date, required: true, description: '开始日期' })
  @ApiQuery({ name: 'endDate', type: Date, required: true, description: '结束日期' })
  @ApiResponse({ status: 200, description: '获取理赔趋势成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async getClaimTrend(
    @Query('period') period: 'day' | 'week' | 'month' | 'year',
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return await this.statisticsService.getClaimTrend(
      period,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('renewal')
  @ApiOperation({ summary: '获取续保统计' })
  @ApiQuery({ name: 'startDate', type: Date, required: true, description: '开始日期' })
  @ApiQuery({ name: 'endDate', type: Date, required: true, description: '结束日期' })
  @ApiResponse({ status: 200, description: '获取续保统计成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async getRenewalStatistics(@Query('startDate') startDate: Date, @Query('endDate') endDate: Date) {
    return await this.statisticsService.getRenewalStatistics(
      new Date(startDate),
      new Date(endDate),
    );
  }
}
