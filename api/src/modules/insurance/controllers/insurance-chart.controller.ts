import { Controller, Get, Query, Res } from '@nestjs/common';
import { InsuranceStatisticsService } from '../services/insurance-statistics.service';
import { ChartType, ChartColorScheme } from '../enums/chart.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('保险台账 - 图表生成')
@Controller('charts')
export class InsuranceChartController {
  constructor(private readonly statisticsService: InsuranceStatisticsService) {}

  @Get('business-statistics')
  @ApiOperation({ summary: '生成业务统计图表' })
  @ApiResponse({ status: 200, description: '图表生成成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: '开始日期 (YYYY-MM-DD)',
  })
  @ApiQuery({ name: 'endDate', required: true, type: String, description: '结束日期 (YYYY-MM-DD)' })
  @ApiQuery({
    name: 'chartType',
    required: false,
    enum: ChartType,
    default: ChartType.PIE,
    description: '图表类型',
  })
  @ApiQuery({
    name: 'colorScheme',
    required: false,
    enum: ChartColorScheme,
    default: ChartColorScheme.DEFAULT,
    description: '颜色方案',
  })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: ['png', 'base64'],
    default: 'png',
    description: '输出格式',
  })
  async generateBusinessStatisticsChart(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('chartType') chartType: ChartType = ChartType.PIE,
    @Query('colorScheme') colorScheme: ChartColorScheme = ChartColorScheme.DEFAULT,
    @Query('format') format: 'png' | 'base64' = 'png',
    @Res() res: Response,
  ) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const chartResponse = await this.statisticsService.generateBusinessStatisticsChart(
        start,
        end,
        chartType,
        colorScheme,
      );

      if (format === 'png') {
        res.setHeader('Content-Type', 'image/png');
        res.send(chartResponse.png);
      } else {
        res.json({ base64: chartResponse.base64 });
      }
    } catch (error) {
      res.status(400).json({ message: '图表生成失败', error: error.message });
    }
  }

  @Get('premium-trend')
  @ApiOperation({ summary: '生成保费趋势图表' })
  @ApiResponse({ status: 200, description: '图表生成成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: '开始日期 (YYYY-MM-DD)',
  })
  @ApiQuery({ name: 'endDate', required: true, type: String, description: '结束日期 (YYYY-MM-DD)' })
  @ApiQuery({
    name: 'period',
    required: true,
    enum: ['day', 'week', 'month', 'year'],
    description: '时间周期',
  })
  @ApiQuery({
    name: 'chartType',
    required: false,
    enum: ChartType,
    default: ChartType.LINE,
    description: '图表类型',
  })
  @ApiQuery({
    name: 'colorScheme',
    required: false,
    enum: ChartColorScheme,
    default: ChartColorScheme.DEFAULT,
    description: '颜色方案',
  })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: ['png', 'base64'],
    default: 'png',
    description: '输出格式',
  })
  async generatePremiumTrendChart(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('period') period: 'day' | 'week' | 'month' | 'year',
    @Query('chartType') chartType: ChartType = ChartType.LINE,
    @Query('colorScheme') colorScheme: ChartColorScheme = ChartColorScheme.DEFAULT,
    @Query('format') format: 'png' | 'base64' = 'png',
    @Res() res: Response,
  ) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const chartResponse = await this.statisticsService.generatePremiumTrendChart(
        period,
        start,
        end,
        chartType,
        colorScheme,
      );

      if (format === 'png') {
        res.setHeader('Content-Type', 'image/png');
        res.send(chartResponse.png);
      } else {
        res.json({ base64: chartResponse.base64 });
      }
    } catch (error) {
      res.status(400).json({ message: '图表生成失败', error: error.message });
    }
  }

  @Get('company-distribution')
  @ApiOperation({ summary: '生成保险公司分布图表' })
  @ApiResponse({ status: 200, description: '图表生成成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: '开始日期 (YYYY-MM-DD)',
  })
  @ApiQuery({ name: 'endDate', required: true, type: String, description: '结束日期 (YYYY-MM-DD)' })
  @ApiQuery({
    name: 'chartType',
    required: false,
    enum: ChartType,
    default: ChartType.DOUGHNUT,
    description: '图表类型',
  })
  @ApiQuery({
    name: 'colorScheme',
    required: false,
    enum: ChartColorScheme,
    default: ChartColorScheme.DEFAULT,
    description: '颜色方案',
  })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: ['png', 'base64'],
    default: 'png',
    description: '输出格式',
  })
  async generateCompanyDistributionChart(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('chartType') chartType: ChartType = ChartType.DOUGHNUT,
    @Query('colorScheme') colorScheme: ChartColorScheme = ChartColorScheme.DEFAULT,
    @Query('format') format: 'png' | 'base64' = 'png',
    @Res() res: Response,
  ) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const chartResponse = await this.statisticsService.generateCompanyDistributionChart(
        start,
        end,
        chartType,
        colorScheme,
      );

      if (format === 'png') {
        res.setHeader('Content-Type', 'image/png');
        res.send(chartResponse.png);
      } else {
        res.json({ base64: chartResponse.base64 });
      }
    } catch (error) {
      res.status(400).json({ message: '图表生成失败', error: error.message });
    }
  }

  @Get('channel-distribution')
  @ApiOperation({ summary: '生成渠道分布图表' })
  @ApiResponse({ status: 200, description: '图表生成成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: '开始日期 (YYYY-MM-DD)',
  })
  @ApiQuery({ name: 'endDate', required: true, type: String, description: '结束日期 (YYYY-MM-DD)' })
  @ApiQuery({
    name: 'chartType',
    required: false,
    enum: ChartType,
    default: ChartType.PIE,
    description: '图表类型',
  })
  @ApiQuery({
    name: 'colorScheme',
    required: false,
    enum: ChartColorScheme,
    default: ChartColorScheme.DEFAULT,
    description: '颜色方案',
  })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: ['png', 'base64'],
    default: 'png',
    description: '输出格式',
  })
  async generateChannelDistributionChart(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('chartType') chartType: ChartType = ChartType.PIE,
    @Query('colorScheme') colorScheme: ChartColorScheme = ChartColorScheme.DEFAULT,
    @Query('format') format: 'png' | 'base64' = 'png',
    @Res() res: Response,
  ) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const chartResponse = await this.statisticsService.generateChannelDistributionChart(
        start,
        end,
        chartType,
        colorScheme,
      );

      if (format === 'png') {
        res.setHeader('Content-Type', 'image/png');
        res.send(chartResponse.png);
      } else {
        res.json({ base64: chartResponse.base64 });
      }
    } catch (error) {
      res.status(400).json({ message: '图表生成失败', error: error.message });
    }
  }

  @Get('settlement')
  @ApiOperation({ summary: '生成结算统计图表' })
  @ApiResponse({ status: 200, description: '图表生成成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: '开始日期 (YYYY-MM-DD)',
  })
  @ApiQuery({ name: 'endDate', required: true, type: String, description: '结束日期 (YYYY-MM-DD)' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['day', 'week', 'month', 'year'],
    default: 'month',
    description: '时间周期',
  })
  @ApiQuery({
    name: 'chartType',
    required: false,
    enum: ChartType,
    default: ChartType.BAR,
    description: '图表类型',
  })
  @ApiQuery({
    name: 'colorScheme',
    required: false,
    enum: ChartColorScheme,
    default: ChartColorScheme.DEFAULT,
    description: '颜色方案',
  })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: ['png', 'base64'],
    default: 'png',
    description: '输出格式',
  })
  async generateSettlementChart(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'month',
    @Query('chartType') chartType: ChartType = ChartType.BAR,
    @Query('colorScheme') colorScheme: ChartColorScheme = ChartColorScheme.DEFAULT,
    @Query('format') format: 'png' | 'base64' = 'png',
    @Res() res: Response,
  ) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const chartResponse = await this.statisticsService.generateSettlementChart(
        start,
        end,
        period,
        chartType,
        colorScheme,
      );

      if (format === 'png') {
        res.setHeader('Content-Type', 'image/png');
        res.send(chartResponse.png);
      } else {
        res.json({ base64: chartResponse.base64 });
      }
    } catch (error) {
      res.status(400).json({ message: '图表生成失败', error: error.message });
    }
  }
}
