import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettlementRecord } from '../entities/settlement-record.entity';
import { SettlementDetail } from '../entities/settlement-detail.entity';
import { InsurancePolicy } from '../entities/insurance-policy.entity';
import { CreateSettlementRecordDto } from '../dto/create-settlement-record.dto';
import { UpdateSettlementRecordDto } from '../dto/update-settlement-record.dto';
import { PaginationDto } from '@shared/dto/common.dto';
import { RabbitMQService } from '@infrastructure/rabbitmq/rabbitmq.service';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SettlementRecordService {
  constructor(
    @InjectRepository(SettlementRecord)
    private readonly settlementRecordRepository: Repository<SettlementRecord>,
    @InjectRepository(SettlementDetail)
    private readonly settlementDetailRepository: Repository<SettlementDetail>,
    @InjectRepository(InsurancePolicy)
    private readonly insurancePolicyRepository: Repository<InsurancePolicy>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async create(createSettlementRecordDto: CreateSettlementRecordDto): Promise<SettlementRecord> {
    // 创建结算记录
    const settlementRecord = this.settlementRecordRepository.create(createSettlementRecordDto);
    const savedSettlement = await this.settlementRecordRepository.save(settlementRecord);

    // 发送消息到队列，异步生成结算明细
    await this.rabbitMQService.emit('insurance.settlement.generate_details', {
      settlementId: savedSettlement.id,
    });

    return savedSettlement;
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ data: SettlementRecord[]; total: number }> {
    const { page = 1, pageSize = 10, keyword } = paginationDto;

    const queryBuilder = this.settlementRecordRepository
      .createQueryBuilder('settlement')
      .leftJoinAndSelect('settlement.channel', 'channel');

    if (keyword) {
      queryBuilder.andWhere(
        'settlement.settlementNumber LIKE :keyword OR settlement.settlementPeriod LIKE :keyword OR channel.channelName LIKE :keyword',
        { keyword: `%${keyword}%` },
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('settlement.createTime', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<SettlementRecord> {
    const settlementRecord = await this.settlementRecordRepository.findOne({
      where: { id },
      relations: ['channel'],
    });

    if (!settlementRecord) {
      throw new NotFoundException(`结算记录 ID ${id} 不存在`);
    }

    return settlementRecord;
  }

  async findDetails(settlementId: string): Promise<SettlementDetail[]> {
    return await this.settlementDetailRepository.find({
      where: { settlementId },
      relations: ['policy'],
    });
  }

  async update(
    id: string,
    updateSettlementRecordDto: UpdateSettlementRecordDto,
  ): Promise<SettlementRecord> {
    const settlementRecord = await this.findOne(id);

    Object.assign(settlementRecord, updateSettlementRecordDto);
    return await this.settlementRecordRepository.save(settlementRecord);
  }

  async confirm(id: string, confirmedBy: string): Promise<SettlementRecord> {
    const settlementRecord = await this.findOne(id);
    settlementRecord.status = 2;
    settlementRecord.confirmedBy = confirmedBy;
    settlementRecord.confirmedAt = new Date();
    return await this.settlementRecordRepository.save(settlementRecord);
  }

  async pay(id: string, paidBy: string): Promise<SettlementRecord> {
    const settlementRecord = await this.findOne(id);
    settlementRecord.status = 3;
    settlementRecord.paidBy = paidBy;
    settlementRecord.paidAt = new Date();
    settlementRecord.settlementDate = new Date();
    return await this.settlementRecordRepository.save(settlementRecord);
  }

  async cancel(id: string): Promise<SettlementRecord> {
    const settlementRecord = await this.findOne(id);
    settlementRecord.status = 4;
    return await this.settlementRecordRepository.save(settlementRecord);
  }

  async remove(id: string): Promise<void> {
    // 先删除结算明细
    await this.settlementDetailRepository.delete({ settlementId: id });
    // 再删除结算记录
    const result = await this.settlementRecordRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`结算记录 ID ${id} 不存在`);
    }
  }

  /**
   * 生成结算明细
   */
  async generateSettlementDetails(settlement: SettlementRecord): Promise<void> {
    // 根据结算类型和渠道查找符合条件的保单
    const queryBuilder = this.insurancePolicyRepository.createQueryBuilder('policy');

    if (settlement.settlementType === 1) {
      // 下游结算：查找该渠道的保单
      queryBuilder.where('policy.channelId = :channelId', { channelId: settlement.channelId });
      queryBuilder.andWhere('policy.downstreamSettled = 0');
    } else if (settlement.settlementType === 2) {
      // 上游结算：查找该渠道的保单
      queryBuilder.where('policy.upstreamChannelId = :channelId', {
        channelId: settlement.channelId,
      });
      queryBuilder.andWhere('policy.upstreamSettled = 0');
    }

    // 根据结算期间筛选保单
    queryBuilder.andWhere('policy.effectiveDate BETWEEN :startDate AND :endDate', {
      startDate: settlement.startDate,
      endDate: settlement.endDate,
    });

    const policies = await queryBuilder.getMany();

    if (policies.length === 0) {
      return;
    }

    // 计算总保费、总佣金等
    let totalPremium = 0;
    let totalCommission = 0;

    // 生成结算明细
    for (const policy of policies) {
      const commissionRate =
        settlement.settlementType === 1
          ? policy.downstreamPolicyRate || 0
          : policy.upstreamPolicyRate || 0;
      const commissionAmount = policy.premium * commissionRate;
      const taxAmount = policy.taxIncluded ? commissionAmount * 0.06 : 0; // 假设税率为6%
      const netAmount = commissionAmount - taxAmount;

      // 创建结算明细
      const detail = this.settlementDetailRepository.create({
        settlementId: settlement.id,
        policyId: policy.id,
        premium: policy.premium,
        commissionRate: commissionRate,
        commissionAmount: commissionAmount,
        taxIncluded: policy.taxIncluded,
        taxAmount: taxAmount,
        netAmount: netAmount,
      });

      await this.settlementDetailRepository.save(detail);

      // 更新总金额
      totalPremium += policy.premium;
      totalCommission += commissionAmount;

      // 标记保单为已结算
      if (settlement.settlementType === 1) {
        policy.downstreamSettled = 1;
        policy.downstreamSettlementDate = new Date();
      } else if (settlement.settlementType === 2) {
        policy.upstreamSettled = 1;
        policy.upstreamSettlementDate = new Date();
      }

      await this.insurancePolicyRepository.save(policy);
    }

    // 更新结算记录的总金额
    settlement.totalPolicies = policies.length;
    settlement.totalPremium = totalPremium;
    settlement.totalCommission = totalCommission;
    settlement.taxAmount = totalCommission * 0.06; // 假设税率为6%
    settlement.netAmount = totalCommission - settlement.taxAmount;
    await this.settlementRecordRepository.save(settlement);
  }

  /**
   * 导出结算单及其明细
   * @param id 结算记录ID
   * @returns 导出文件路径
   */
  async exportSettlement(id: string): Promise<string> {
    // 查找结算记录
    const settlementRecord = await this.settlementRecordRepository.findOne({
      where: { id },
      relations: ['channel'],
    });

    if (!settlementRecord) {
      throw new NotFoundException(`结算记录 ID ${id} 不存在`);
    }

    // 查找结算明细
    const settlementDetails = await this.settlementDetailRepository.find({
      where: { settlementId: id },
      relations: ['policy'],
    });

    // 准备结算单汇总数据
    const settlementSummary = [
      ['结算单信息', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      [
        '结算单号',
        settlementRecord.settlementNumber,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ],
      [
        '结算期间',
        `${settlementRecord.startDate.toLocaleDateString()} 至 ${settlementRecord.endDate.toLocaleDateString()}`,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ],
      [
        '结算渠道',
        settlementRecord.channel.channelName,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ],
      [
        '结算类型',
        settlementRecord.settlementType === 1 ? '下游结算' : '上游结算',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ],
      [
        '结算状态',
        this.getSettlementStatusText(settlementRecord.status),
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ],
      [
        '总保单数',
        settlementRecord.totalPolicies,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ],
      ['总保费', settlementRecord.totalPremium, '', '', '', '', '', '', '', '', '', '', '', '', ''],
      [
        '总佣金',
        settlementRecord.totalCommission,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ],
      ['税费', settlementRecord.taxAmount, '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['净佣金', settlementRecord.netAmount, '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ];

    // 准备结算明细数据
    const settlementDetailHeaders = [
      '序号',
      '保单号',
      '投保人',
      '车牌号',
      '保险公司',
      '保险产品',
      '起保日期',
      '止保日期',
      '生效日期',
      '保费',
      '佣金率',
      '佣金金额',
      '是否含税',
      '税费',
      '净佣金',
      '备注',
    ];

    const settlementDetailData = settlementDetails.map((detail, index) => [
      index + 1,
      detail.policy.policyNumber,
      detail.policy.policyHolder?.holderName || '',
      detail.policy.policyHolder?.licensePlate || '',
      detail.policy.insuranceCompany?.companyName || '',
      detail.policy.insuranceProduct?.productName || '',
      detail.policy.effectiveDate?.toLocaleDateString() || '',
      detail.policy.expiryDate?.toLocaleDateString() || '',
      detail.policy.effectiveDate?.toLocaleDateString() || '',
      detail.premium,
      detail.commissionRate,
      detail.commissionAmount,
      detail.taxIncluded === 1 ? '是' : '否',
      detail.taxAmount,
      detail.netAmount,
      detail.policy.remarks || '',
    ]);

    // 创建Excel工作簿
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([]);

    // 合并单元格
    const mergeOptions = {
      s: { r: 0, c: 0 },
      e: { r: 0, c: 14 },
    };
    worksheet['!merges'] = [mergeOptions];

    // 设置标题样式
    const titleCell = worksheet['A1'];
    if (titleCell) {
      titleCell.v = '结算单汇总';
      titleCell.s = {
        font: { bold: true, size: 16 },
        alignment: { horizontal: 'center', vertical: 'center' },
        fill: { fgColor: { rgb: 'FFC0000' } },
      };
    }

    // 添加汇总数据
    XLSX.utils.sheet_add_aoa(worksheet, settlementSummary, { origin: 'A1' });

    // 添加明细表头
    XLSX.utils.sheet_add_aoa(worksheet, [settlementDetailHeaders], {
      origin: `A${settlementSummary.length + 1}`,
    });

    // 添加明细数据
    XLSX.utils.sheet_add_aoa(worksheet, settlementDetailData, {
      origin: `A${settlementSummary.length + 2}`,
    });

    // 调整列宽
    const columnWidths = [
      { wch: 10 }, // 序号
      { wch: 20 }, // 保单号
      { wch: 15 }, // 投保人
      { wch: 15 }, // 车牌号
      { wch: 20 }, // 保险公司
      { wch: 20 }, // 保险产品
      { wch: 15 }, // 起保日期
      { wch: 15 }, // 止保日期
      { wch: 15 }, // 生效日期
      { wch: 10 }, // 保费
      { wch: 10 }, // 佣金率
      { wch: 12 }, // 佣金金额
      { wch: 10 }, // 是否含税
      { wch: 10 }, // 税费
      { wch: 12 }, // 净佣金
      { wch: 20 }, // 备注
    ];
    worksheet['!cols'] = columnWidths;

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, '结算单明细');

    // 确保导出目录存在
    const exportDir = './exports/settlements';
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // 生成文件名
    const filename = `settlement_${settlementRecord.settlementNumber}_${Date.now()}.xlsx`;
    const filePath = path.join(exportDir, filename);

    // 保存Excel文件
    XLSX.writeFile(workbook, filePath);

    return filePath;
  }

  /**
   * 获取结算状态文本
   * @param status 结算状态
   * @returns 结算状态文本
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
}
