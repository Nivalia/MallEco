import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { InsurancePolicy } from '../entities/insurance-policy.entity';
import { SettlementRecord } from '../entities/settlement-record.entity';
import { InsuranceCompany } from '../entities/insurance-company.entity';
import { Channel } from '../entities/channel.entity';
import { ClaimRecord } from '../entities/claim-record.entity';
import { RenewalRecord } from '../entities/renewal-record.entity';
import { AdvancedCacheService } from '@infrastructure/cache/advanced-cache.service';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from '@infrastructure/rabbitmq/rabbitmq.service';
import { ChartRenderService } from '@infrastructure/services/chart-render.service';
import { ChartType, ChartColorScheme } from '../enums/chart.enum';
import { ChartConfig, ChartData, ChartResponse } from '../interfaces/chart.interface';

@Injectable()
export class InsuranceStatisticsService {
  private readonly DEFAULT_CACHE_TTL = 3600; // 1小时
  private readonly CACHE_KEY_PREFIX = 'insurance:statistics';

  constructor(
    @InjectRepository(InsurancePolicy)
    private readonly insurancePolicyRepository: Repository<InsurancePolicy>,
    @InjectRepository(SettlementRecord)
    private readonly settlementRecordRepository: Repository<SettlementRecord>,
    @InjectRepository(InsuranceCompany)
    private readonly insuranceCompanyRepository: Repository<InsuranceCompany>,
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    @InjectRepository(ClaimRecord)
    private readonly claimRecordRepository: Repository<ClaimRecord>,
    @InjectRepository(RenewalRecord)
    private readonly renewalRecordRepository: Repository<RenewalRecord>,
    private readonly cacheService: AdvancedCacheService,
    private readonly configService: ConfigService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly chartRenderService: ChartRenderService,
  ) {
    const insuranceCacheConfig = this.configService.get('performance.cache.modules.insurance');
    if (insuranceCacheConfig) {
      this.DEFAULT_CACHE_TTL = insuranceCacheConfig.ttl;
    }
  }

  /**
   * 清除统计分析缓存
   */
  async clearStatisticsCache(): Promise<void> {
    await this.cacheService.clearCache(`${this.CACHE_KEY_PREFIX}:*`);
  }

  /**
   * 获取保险业务统计数据
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 统计数据
   */
  async getBusinessStatistics(startDate: Date, endDate: Date) {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:business:start=${startDate.toISOString()}:end=${endDate.toISOString()}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        // 查询保单数据
        const totalPolicies = await this.insurancePolicyRepository.count({
          where: {
            effectiveDate: Between(startDate, endDate),
          },
        });

        const activePolicies = await this.insurancePolicyRepository.count({
          where: {
            effectiveDate: LessThanOrEqual(new Date()),
            expiryDate: MoreThanOrEqual(new Date()),
          },
        });

        // 查询保费数据
        const premiumResult = await this.insurancePolicyRepository
          .createQueryBuilder('policy')
          .select('SUM(policy.premium)', 'totalPremium')
          .where('policy.effectiveDate BETWEEN :startDate AND :endDate', { startDate, endDate })
          .getRawOne();

        // 查询佣金数据
        const commissionResult = await this.settlementRecordRepository
          .createQueryBuilder('settlement')
          .select('SUM(settlement.totalCommission)', 'totalCommission')
          .addSelect('SUM(settlement.netAmount)', 'totalNetAmount')
          .where('settlement.createTime BETWEEN :startDate AND :endDate', { startDate, endDate })
          .getRawOne();

        return {
          totalPolicies,
          activePolicies,
          totalPremium: parseFloat(premiumResult.totalPremium || 0),
          totalCommission: parseFloat(commissionResult.totalCommission || 0),
          totalNetAmount: parseFloat(commissionResult.totalNetAmount || 0),
        };
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  /**
   * 获取保费趋势分析数据
   * @param period 时间周期：day, week, month, year
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 趋势数据
   */
  async getPremiumTrend(period: 'day' | 'week' | 'month' | 'year', startDate: Date, endDate: Date) {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:trend:period=${period}:start=${startDate.toISOString()}:end=${endDate.toISOString()}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        // 根据周期构建查询
        let dateFormat: string;
        switch (period) {
          case 'day':
            dateFormat = 'DATE_FORMAT(policy.effectiveDate, "%Y-%m-%d")';
            break;
          case 'week':
            dateFormat = 'CONCAT(YEAR(policy.effectiveDate), "-W", WEEK(policy.effectiveDate))';
            break;
          case 'month':
            dateFormat = 'DATE_FORMAT(policy.effectiveDate, "%Y-%m")';
            break;
          case 'year':
            dateFormat = 'YEAR(policy.effectiveDate)';
            break;
        }

        const trendData = await this.insurancePolicyRepository
          .createQueryBuilder('policy')
          .select(`${dateFormat} as period`)
          .addSelect('COUNT(policy.id) as policyCount')
          .addSelect('SUM(policy.premium) as totalPremium')
          .where('policy.effectiveDate BETWEEN :startDate AND :endDate', { startDate, endDate })
          .groupBy('period')
          .orderBy('period')
          .getRawMany();

        return trendData;
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  /**
   * 获取保险公司分布数据
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 分布数据
   */
  async getCompanyDistribution(startDate: Date, endDate: Date) {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:company:start=${startDate.toISOString()}:end=${endDate.toISOString()}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        const distributionData = await this.insurancePolicyRepository
          .createQueryBuilder('policy')
          .select('insuranceCompany.companyName as companyName')
          .addSelect('COUNT(policy.id) as policyCount')
          .addSelect('SUM(policy.premium) as totalPremium')
          .innerJoin('policy.insuranceCompany', 'insuranceCompany')
          .where('policy.effectiveDate BETWEEN :startDate AND :endDate', { startDate, endDate })
          .groupBy('insuranceCompany.id')
          .orderBy('totalPremium', 'DESC')
          .getRawMany();

        return distributionData;
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  /**
   * 获取渠道分布数据
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 分布数据
   */
  async getChannelDistribution(startDate: Date, endDate: Date) {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:channel:start=${startDate.toISOString()}:end=${endDate.toISOString()}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        const distributionData = await this.insurancePolicyRepository
          .createQueryBuilder('policy')
          .select('channel.channelName as channelName')
          .addSelect('COUNT(policy.id) as policyCount')
          .addSelect('SUM(policy.premium) as totalPremium')
          .innerJoin('policy.channel', 'channel')
          .where('policy.effectiveDate BETWEEN :startDate AND :endDate', { startDate, endDate })
          .groupBy('channel.id')
          .orderBy('totalPremium', 'DESC')
          .getRawMany();

        return distributionData;
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  /**
   * 获取结算数据统计
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 结算统计数据
   */
  async getSettlementStatistics(startDate: Date, endDate: Date) {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:settlement:start=${startDate.toISOString()}:end=${endDate.toISOString()}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        // 查询结算记录
        const totalSettlements = await this.settlementRecordRepository.count({
          where: {
            createTime: Between(startDate, endDate),
          },
        });

        // 查询结算金额
        const settlementResult = await this.settlementRecordRepository
          .createQueryBuilder('settlement')
          .select('SUM(settlement.totalCommission)', 'totalCommission')
          .addSelect('SUM(settlement.taxAmount)', 'totalTaxAmount')
          .addSelect('SUM(settlement.netAmount)', 'totalNetAmount')
          .where('settlement.createTime BETWEEN :startDate AND :endDate', { startDate, endDate })
          .getRawOne();

        // 按状态统计结算记录
        const statusCounts = await this.settlementRecordRepository
          .createQueryBuilder('settlement')
          .select('settlement.status', 'status')
          .addSelect('COUNT(settlement.id)', 'count')
          .where('settlement.createTime BETWEEN :startDate AND :endDate', { startDate, endDate })
          .groupBy('settlement.status')
          .getRawMany();

        return {
          totalSettlements,
          totalCommission: parseFloat(settlementResult.totalCommission || 0),
          totalTaxAmount: parseFloat(settlementResult.totalTaxAmount || 0),
          totalNetAmount: parseFloat(settlementResult.totalNetAmount || 0),
          statusDistribution: statusCounts.map(item => ({
            status: parseInt(item.status),
            statusText: this.getSettlementStatusText(parseInt(item.status)),
            count: parseInt(item.count),
          })),
        };
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  /**
   * 获取结算趋势数据
   * @param period 时间周期
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 趋势数据
   */
  async getSettlementTrend(
    period: 'day' | 'week' | 'month' | 'year',
    startDate: Date,
    endDate: Date,
  ) {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:settlement:trend:period=${period}:start=${startDate.toISOString()}:end=${endDate.toISOString()}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        // 根据周期构建查询
        let dateFormat: string;
        switch (period) {
          case 'day':
            dateFormat = 'DATE_FORMAT(settlement.createTime, "%Y-%m-%d")';
            break;
          case 'week':
            dateFormat = 'CONCAT(YEAR(settlement.createTime), "-W", WEEK(settlement.createTime))';
            break;
          case 'month':
            dateFormat = 'DATE_FORMAT(settlement.createTime, "%Y-%m")';
            break;
          case 'year':
            dateFormat = 'YEAR(settlement.createTime)';
            break;
        }

        const trendData = await this.settlementRecordRepository
          .createQueryBuilder('settlement')
          .select(`${dateFormat} as period`)
          .addSelect('COUNT(settlement.id) as settlementCount')
          .addSelect('SUM(settlement.totalCommission) as totalCommission')
          .addSelect('SUM(settlement.netAmount) as netAmount')
          .where('settlement.createTime BETWEEN :startDate AND :endDate', { startDate, endDate })
          .groupBy('period')
          .orderBy('period')
          .getRawMany();

        return trendData.map(item => ({
          period: item.period,
          settlementCount: parseInt(item.settlementCount || 0),
          totalCommission: parseFloat(item.totalCommission || 0),
          netAmount: parseFloat(item.netAmount || 0),
        }));
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  /**
   * 获取结算状态文本
   * @param status 状态
   * @returns 状态文本
   */
  private getSettlementStatusText(status: number): string {
    const statusMap = {
      1: '待确认',
      2: '已确认',
      3: '已支付',
      4: '已取消',
    };
    return statusMap[status] || '未知状态';
  }

  /**
   * 异步更新所有统计数据
   * @param startDate 开始日期
   * @param endDate 结束日期
   */
  async updateAllStatistics(startDate: Date, endDate: Date): Promise<void> {
    try {
      // 清除旧缓存
      await this.clearStatisticsCache();

      // 预计算并缓存所有统计数据
      await Promise.all([
        this.getBusinessStatistics(startDate, endDate),
        this.getPremiumTrend('month', startDate, endDate),
        this.getCompanyDistribution(startDate, endDate),
        this.getChannelDistribution(startDate, endDate),
        this.getSettlementStatistics(startDate, endDate),
      ]);
    } catch (error) {
      console.error('更新统计数据失败:', error);
      throw error;
    }
  }

  /**
   * 触发统计数据异步更新
   * @param startDate 开始日期
   * @param endDate 结束日期
   */
  async triggerStatisticsUpdate(startDate?: Date, endDate?: Date): Promise<void> {
    // 设置默认日期范围为最近30天
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    const defaultEndDate = new Date();

    // 使用提供的日期或默认日期
    const actualStartDate = startDate || defaultStartDate;
    const actualEndDate = endDate || defaultEndDate;

    // 发送消息到RabbitMQ队列
    await this.rabbitMQService.emit('insurance.statistics.update', {
      startDate: actualStartDate.toISOString(),
      endDate: actualEndDate.toISOString(),
    });
  }

  /**
   * 生成业务统计图表
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param chartType 图表类型
   * @param colorScheme 颜色方案
   * @returns 图表响应
   */
  async generateBusinessStatisticsChart(
    startDate: Date,
    endDate: Date,
    chartType: ChartType = ChartType.PIE,
    colorScheme: ChartColorScheme = ChartColorScheme.DEFAULT,
  ): Promise<ChartResponse> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:chart:business:start=${startDate.toISOString()}:end=${endDate.toISOString()}:type=${chartType}:scheme=${colorScheme}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        // 获取业务统计数据
        const stats = await this.getBusinessStatistics(startDate, endDate);

        // 构建图表数据
        const chartData: ChartData = {
          labels: ['总保单数', '有效保单数', '总保费', '总佣金', '净收入'],
          datasets: [
            {
              label: '业务统计',
              data: [
                stats.totalPolicies,
                stats.activePolicies,
                stats.totalPremium,
                stats.totalCommission,
                stats.totalNetAmount,
              ],
              backgroundColor: [],
              borderColor: [],
            },
          ],
        };

        // 配置图表
        const chartConfig: ChartConfig = {
          type: chartType,
          title: '保险业务统计',
          subtitle: `${startDate.toLocaleDateString()} 至 ${endDate.toLocaleDateString()}`,
          width: 800,
          height: 400,
          colorScheme: colorScheme,
          responsive: true,
          maintainAspectRatio: true,
          animation: true,
          legend: {
            display: true,
            position: 'top',
          },
        };

        // 渲染图表
        return await this.chartRenderService.renderChart(chartConfig, chartData);
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  /**
   * 生成保费趋势图表
   * @param period 时间周期
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param chartType 图表类型
   * @param colorScheme 颜色方案
   * @returns 图表响应
   */
  async generatePremiumTrendChart(
    period: 'day' | 'week' | 'month' | 'year',
    startDate: Date,
    endDate: Date,
    chartType: ChartType = ChartType.LINE,
    colorScheme: ChartColorScheme = ChartColorScheme.DEFAULT,
  ): Promise<ChartResponse> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:chart:trend:period=${period}:start=${startDate.toISOString()}:end=${endDate.toISOString()}:type=${chartType}:scheme=${colorScheme}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        // 获取保费趋势数据
        const trendData = await this.getPremiumTrend(period, startDate, endDate);

        // 构建图表数据
        const chartData: ChartData = {
          labels: trendData.map(item => item.period),
          datasets: [
            {
              label: '保费',
              data: trendData.map(item => item.totalPremium),
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 2,
              fill: true,
              tension: 0.1,
            },
            {
              label: '保单数',
              data: trendData.map(item => item.policyCount),
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2,
              fill: true,
              tension: 0.1,
            },
          ],
        };

        // 配置图表
        const chartConfig: ChartConfig = {
          type: chartType,
          title: '保费趋势分析',
          subtitle: `${startDate.toLocaleDateString()} 至 ${endDate.toLocaleDateString()}`,
          width: 1000,
          height: 500,
          colorScheme: colorScheme,
          responsive: true,
          maintainAspectRatio: true,
          animation: true,
          legend: {
            display: true,
            position: 'top',
          },
          tooltips: {
            enabled: true,
            mode: 'index',
          },
        };

        // 渲染图表
        return await this.chartRenderService.renderChart(chartConfig, chartData);
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  /**
   * 生成保险公司分布图表
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param chartType 图表类型
   * @param colorScheme 颜色方案
   * @returns 图表响应
   */
  async generateCompanyDistributionChart(
    startDate: Date,
    endDate: Date,
    chartType: ChartType = ChartType.DOUGHNUT,
    colorScheme: ChartColorScheme = ChartColorScheme.DEFAULT,
  ): Promise<ChartResponse> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:chart:company-distribution:start=${startDate.toISOString()}:end=${endDate.toISOString()}:type=${chartType}:scheme=${colorScheme}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        // 获取保险公司分布数据
        const distribution = await this.getCompanyDistribution(startDate, endDate);

        // 构建图表数据
        const chartData: ChartData = {
          labels: distribution.map(item => item.companyName),
          datasets: [
            {
              label: '保险公司分布',
              data: distribution.map(item => item.premium),
              backgroundColor: [],
              borderColor: [],
              borderWidth: 1,
            },
          ],
        };

        // 配置图表
        const chartConfig: ChartConfig = {
          type: chartType,
          title: '保险公司保费分布',
          subtitle: `${startDate.toLocaleDateString()} 至 ${endDate.toLocaleDateString()}`,
          width: 800,
          height: 400,
          colorScheme: colorScheme,
          responsive: true,
          maintainAspectRatio: true,
          animation: true,
          legend: {
            display: true,
            position:
              chartType === ChartType.PIE || chartType === ChartType.DOUGHNUT ? 'right' : 'top',
          },
          tooltips: {
            enabled: true,
            mode: 'single',
            callbacks: {
              label: function (context: any) {
                const label = context.label || '';
                const value = (context.raw as number) || 0;
                const total = (context.dataset.data as number[]).reduce(
                  (a: number, b: number) => a + b,
                  0,
                );
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value.toFixed(2)} (${percentage}%)`;
              },
            },
          },
        };

        // 渲染图表
        return await this.chartRenderService.renderChart(chartConfig, chartData);
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  /**
   * 生成渠道分布图表
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param chartType 图表类型
   * @param colorScheme 颜色方案
   * @returns 图表响应
   */
  async generateChannelDistributionChart(
    startDate: Date,
    endDate: Date,
    chartType: ChartType = ChartType.PIE,
    colorScheme: ChartColorScheme = ChartColorScheme.DEFAULT,
  ): Promise<ChartResponse> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:chart:channel-distribution:start=${startDate.toISOString()}:end=${endDate.toISOString()}:type=${chartType}:scheme=${colorScheme}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        // 获取渠道分布数据
        const distribution = await this.getChannelDistribution(startDate, endDate);

        // 构建图表数据
        const chartData: ChartData = {
          labels: distribution.map(item => item.channelName),
          datasets: [
            {
              label: '渠道分布',
              data: distribution.map(item => item.premium),
              backgroundColor: [],
              borderColor: [],
              borderWidth: 1,
            },
          ],
        };

        // 配置图表
        const chartConfig: ChartConfig = {
          type: chartType,
          title: '渠道保费分布',
          subtitle: `${startDate.toLocaleDateString()} 至 ${endDate.toLocaleDateString()}`,
          width: 800,
          height: 400,
          colorScheme: colorScheme,
          responsive: true,
          maintainAspectRatio: true,
          animation: true,
          legend: {
            display: true,
            position:
              chartType === ChartType.PIE || chartType === ChartType.DOUGHNUT ? 'right' : 'top',
          },
          tooltips: {
            enabled: true,
            mode: 'single',
            callbacks: {
              label: function (context: any) {
                const label = context.label || '';
                const value = (context.raw as number) || 0;
                const total = (context.dataset.data as number[]).reduce(
                  (a: number, b: number) => a + b,
                  0,
                );
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value.toFixed(2)} (${percentage}%)`;
              },
            },
          },
        };

        // 渲染图表
        return await this.chartRenderService.renderChart(chartConfig, chartData);
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  /**
   * 生成结算统计图表
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param period 时间周期
   * @param chartType 图表类型
   * @param colorScheme 颜色方案
   * @returns 图表响应
   */
  async generateSettlementChart(
    startDate: Date,
    endDate: Date,
    period: 'day' | 'week' | 'month' | 'year' = 'month',
    chartType: ChartType = ChartType.BAR,
    colorScheme: ChartColorScheme = ChartColorScheme.DEFAULT,
  ): Promise<ChartResponse> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:chart:settlement:period=${period}:start=${startDate.toISOString()}:end=${endDate.toISOString()}:type=${chartType}:scheme=${colorScheme}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        // 获取结算趋势数据
        const settlementData = await this.getSettlementTrend(period, startDate, endDate);

        // 构建图表数据
        const chartData: ChartData = {
          labels: settlementData.map(item => item.period),
          datasets: [
            {
              label: '总佣金',
              data: settlementData.map(item => item.totalCommission),
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
            {
              label: '净收入',
              data: settlementData.map(item => item.netAmount),
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
            {
              label: '结算单数',
              data: settlementData.map(item => item.settlementCount),
              backgroundColor: 'rgba(153, 102, 255, 0.5)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1,
            },
          ],
        };

        // 配置图表
        const chartConfig: ChartConfig = {
          type: chartType,
          title: '结算统计分析',
          subtitle: `${startDate.toLocaleDateString()} 至 ${endDate.toLocaleDateString()}`,
          width: 1000,
          height: 500,
          colorScheme: colorScheme,
          responsive: true,
          maintainAspectRatio: true,
          animation: true,
          legend: {
            display: true,
            position: 'top',
          },
          tooltips: {
            enabled: true,
            mode: 'index',
          },
        };

        // 渲染图表
        return await this.chartRenderService.renderChart(chartConfig, chartData);
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  /**
   * 获取理赔统计数据
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 理赔统计数据
   */
  async getClaimStatistics(startDate: Date, endDate: Date) {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:claim:start=${startDate.toISOString()}:end=${endDate.toISOString()}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        // 查询理赔记录总数
        const totalClaims = await this.claimRecordRepository.count({
          where: {
            createTime: Between(startDate, endDate),
          },
        });

        // 查询理赔金额
        const claimAmountResult = await this.claimRecordRepository
          .createQueryBuilder('claim')
          .select('SUM(claim.claimAmount)', 'totalClaimAmount')
          .where('claim.createTime BETWEEN :startDate AND :endDate', { startDate, endDate })
          .getRawOne();

        // 按状态统计理赔记录
        const statusCounts = await this.claimRecordRepository
          .createQueryBuilder('claim')
          .select('claim.claimStatus', 'status')
          .addSelect('COUNT(claim.id)', 'count')
          .where('claim.createTime BETWEEN :startDate AND :endDate', { startDate, endDate })
          .groupBy('claim.claimStatus')
          .getRawMany();

        return {
          totalClaims,
          totalClaimAmount: parseFloat(claimAmountResult.totalClaimAmount || 0),
          statusDistribution: statusCounts.map(item => ({
            status: parseInt(item.status),
            statusText: this.getClaimStatusText(parseInt(item.status)),
            count: parseInt(item.count),
          })),
        };
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  /**
   * 获取理赔趋势数据
   * @param period 时间周期
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 理赔趋势数据
   */
  async getClaimTrend(period: 'day' | 'week' | 'month' | 'year', startDate: Date, endDate: Date) {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:claim:trend:period=${period}:start=${startDate.toISOString()}:end=${endDate.toISOString()}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        // 根据周期构建查询
        let dateFormat: string;
        switch (period) {
          case 'day':
            dateFormat = 'DATE_FORMAT(claim.createTime, "%Y-%m-%d")';
            break;
          case 'week':
            dateFormat = 'CONCAT(YEAR(claim.createTime), "-W", WEEK(claim.createTime))';
            break;
          case 'month':
            dateFormat = 'DATE_FORMAT(claim.createTime, "%Y-%m")';
            break;
          case 'year':
            dateFormat = 'YEAR(claim.createTime)';
            break;
        }

        const trendData = await this.claimRecordRepository
          .createQueryBuilder('claim')
          .select(`${dateFormat} as period`)
          .addSelect('COUNT(claim.id) as claimCount')
          .addSelect('SUM(claim.claimAmount) as totalClaimAmount')
          .where('claim.createTime BETWEEN :startDate AND :endDate', { startDate, endDate })
          .groupBy('period')
          .orderBy('period')
          .getRawMany();

        return trendData.map(item => ({
          period: item.period,
          claimCount: parseInt(item.claimCount || 0),
          totalClaimAmount: parseFloat(item.totalClaimAmount || 0),
        }));
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  /**
   * 获取理赔状态文本
   * @param status 状态
   * @returns 状态文本
   */
  private getClaimStatusText(status: number): string {
    const statusMap = {
      0: '待处理',
      1: '处理中',
      2: '已完成',
      3: '已拒绝',
    };
    return statusMap[status] || '未知状态';
  }

  /**
   * 生成理赔统计图表
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param period 时间周期
   * @param chartType 图表类型
   * @param colorScheme 颜色方案
   * @returns 图表响应
   */
  async generateClaimChart(
    startDate: Date,
    endDate: Date,
    period: 'day' | 'week' | 'month' | 'year' = 'month',
    chartType: ChartType = ChartType.BAR,
    colorScheme: ChartColorScheme = ChartColorScheme.DEFAULT,
  ): Promise<ChartResponse> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:chart:claim:period=${period}:start=${startDate.toISOString()}:end=${endDate.toISOString()}:type=${chartType}:scheme=${colorScheme}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        // 获取理赔趋势数据
        const claimData = await this.getClaimTrend(period, startDate, endDate);

        // 构建图表数据
        const chartData: ChartData = {
          labels: claimData.map(item => item.period),
          datasets: [
            {
              label: '理赔金额',
              data: claimData.map(item => item.totalClaimAmount),
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
            {
              label: '理赔单数',
              data: claimData.map(item => item.claimCount),
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        };

        // 配置图表
        const chartConfig: ChartConfig = {
          type: chartType,
          title: '理赔统计分析',
          subtitle: `${startDate.toLocaleDateString()} 至 ${endDate.toLocaleDateString()}`,
          width: 1000,
          height: 500,
          colorScheme: colorScheme,
          responsive: true,
          maintainAspectRatio: true,
          animation: true,
          legend: {
            display: true,
            position: 'top',
          },
          tooltips: {
            enabled: true,
            mode: 'index',
          },
        };

        // 渲染图表
        return await this.chartRenderService.renderChart(chartConfig, chartData);
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  /**
   * 获取续保统计数据
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 续保统计数据
   */
  async getRenewalStatistics(startDate: Date, endDate: Date) {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:renewal:start=${startDate.toISOString()}:end=${endDate.toISOString()}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        // 查询续保记录总数
        const totalRenewals = await this.renewalRecordRepository.count({
          where: {
            createTime: Between(startDate, endDate),
          },
        });

        // 查询续保保费
        const renewalPremiumResult = await this.renewalRecordRepository
          .createQueryBuilder('renewal')
          .select('SUM(renewal.renewalPremium)', 'totalRenewalPremium')
          .where('renewal.createTime BETWEEN :startDate AND :endDate', { startDate, endDate })
          .getRawOne();

        // 按状态统计续保记录
        const statusCounts = await this.renewalRecordRepository
          .createQueryBuilder('renewal')
          .select('renewal.renewalStatus', 'status')
          .addSelect('COUNT(renewal.id)', 'count')
          .where('renewal.createTime BETWEEN :startDate AND :endDate', { startDate, endDate })
          .groupBy('renewal.renewalStatus')
          .getRawMany();

        return {
          totalRenewals,
          totalRenewalPremium: parseFloat(renewalPremiumResult.totalRenewalPremium || 0),
          statusDistribution: statusCounts.map(item => ({
            status: parseInt(item.status),
            statusText: this.getRenewalStatusText(parseInt(item.status)),
            count: parseInt(item.count),
          })),
        };
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  /**
   * 获取续保状态文本
   * @param status 状态
   * @returns 状态文本
   */
  private getRenewalStatusText(status: number): string {
    const statusMap = {
      0: '待处理',
      1: '处理中',
      2: '已完成',
      3: '已拒绝',
      4: '已过期',
    };
    return statusMap[status] || '未知状态';
  }

  /**
   * 生成续保统计图表
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param chartType 图表类型
   * @param colorScheme 颜色方案
   * @returns 图表响应
   */
  async generateRenewalChart(
    startDate: Date,
    endDate: Date,
    chartType: ChartType = ChartType.PIE,
    colorScheme: ChartColorScheme = ChartColorScheme.DEFAULT,
  ): Promise<ChartResponse> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:chart:renewal:start=${startDate.toISOString()}:end=${endDate.toISOString()}:type=${chartType}:scheme=${colorScheme}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        // 获取续保统计数据
        const renewalData = await this.getRenewalStatistics(startDate, endDate);

        // 构建图表数据
        const chartData: ChartData = {
          labels: renewalData.statusDistribution.map(item => item.statusText),
          datasets: [
            {
              label: '续保状态分布',
              data: renewalData.statusDistribution.map(item => item.count),
              backgroundColor: [],
              borderColor: [],
              borderWidth: 1,
            },
          ],
        };

        // 配置图表
        const chartConfig: ChartConfig = {
          type: chartType,
          title: '续保状态分布',
          subtitle: `${startDate.toLocaleDateString()} 至 ${endDate.toLocaleDateString()}`,
          width: 800,
          height: 400,
          colorScheme: colorScheme,
          responsive: true,
          maintainAspectRatio: true,
          animation: true,
          legend: {
            display: true,
            position: 'top',
          },
        };

        // 渲染图表
        return await this.chartRenderService.renderChart(chartConfig, chartData);
      },
      this.DEFAULT_CACHE_TTL,
    );
  }
}
