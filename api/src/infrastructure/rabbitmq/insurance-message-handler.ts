import { Injectable, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { InsurancePolicyService } from '../../modules/insurance/services/insurance-policy.service';
import { SettlementRecordService } from '../../modules/insurance/services/settlement-record.service';
import { InsuranceStatisticsService } from '../../modules/insurance/services/insurance-statistics.service';

@Injectable()
export class InsuranceMessageHandler {
  private readonly logger = new Logger(InsuranceMessageHandler.name);

  constructor(
    private readonly insurancePolicyService: InsurancePolicyService,
    private readonly settlementRecordService: SettlementRecordService,
    private readonly statisticsService: InsuranceStatisticsService,
  ) {}

  /**
   * 处理保险保单批量导入事件
   * @param data 导入数据
   */
  @EventPattern('insurance.policy.batch_import')
  async handlePolicyBatchImport(data: any) {
    this.logger.log(`开始处理保单批量导入任务: ${data.taskId}`);
    this.logger.log(`导入记录总数: ${data.data.length}`);

    try {
      const result = await this.insurancePolicyService.processBatchImport(data);

      this.logger.log(`保单批量导入任务完成: ${data.taskId}`);
      this.logger.log(`成功导入: ${result.successCount} 条`);
      this.logger.log(`失败导入: ${result.failedCount} 条`);

      if (result.failedReasons.length > 0) {
        this.logger.warn(`失败原因: ${JSON.stringify(result.failedReasons)}`);
      }
    } catch (error) {
      this.logger.error(`处理保单批量导入任务失败: ${data.taskId}`, error);
    }
  }

  /**
   * 处理结算明细生成事件
   * @param data 结算记录ID
   */
  @EventPattern('insurance.settlement.generate_details')
  async handleSettlementGenerateDetails(data: any) {
    this.logger.log(`开始处理结算明细生成任务: 结算记录ID=${data.settlementId}`);

    try {
      // 查找结算记录
      const settlement = await this.settlementRecordService.findOne(data.settlementId);

      // 生成结算明细
      await this.settlementRecordService.generateSettlementDetails(settlement);

      this.logger.log(`结算明细生成任务完成: 结算记录ID=${data.settlementId}`);
    } catch (error) {
      this.logger.error(`处理结算明细生成任务失败: 结算记录ID=${data.settlementId}`, error);
    }
  }

  /**
   * 处理统计数据更新事件
   * @param data 开始和结束日期
   */
  @EventPattern('insurance.statistics.update')
  async handleStatisticsUpdate(data: any) {
    this.logger.log(
      `开始处理统计数据更新任务: 开始日期=${data.startDate}, 结束日期=${data.endDate}`,
    );

    try {
      // 转换日期字符串为Date对象
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      // 更新所有统计数据
      await this.statisticsService.updateAllStatistics(startDate, endDate);

      this.logger.log(`统计数据更新任务完成: 开始日期=${data.startDate}, 结束日期=${data.endDate}`);
    } catch (error) {
      this.logger.error(
        `处理统计数据更新任务失败: 开始日期=${data.startDate}, 结束日期=${data.endDate}`,
        error,
      );
    }
  }
}
