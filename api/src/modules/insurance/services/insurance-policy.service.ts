import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { InsurancePolicy } from '../entities/insurance-policy.entity';
import { CreateInsurancePolicyDto } from '../dto/create-insurance-policy.dto';
import { UpdateInsurancePolicyDto } from '../dto/update-insurance-policy.dto';
import { PaginationDto } from '@shared/dto/common.dto';
import { Member } from '@modules/framework/entities/member.entity';
import {
  PointsRecord,
  PointsRecordType,
  PointsRecordSource,
} from '@modules/framework/entities/points-record.entity';
import { PointsRecordService } from '@modules/manager/services/points/points-record.service';
import * as XLSX from 'xlsx';
import { InsuranceCompany } from '../entities/insurance-company.entity';
import { InsuranceProduct } from '../entities/insurance-product.entity';
import { PolicyHolder } from '../entities/policy-holder.entity';
import { Channel } from '../entities/channel.entity';
import { AdvancedCacheService } from '@infrastructure/cache/advanced-cache.service';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from '@infrastructure/rabbitmq/rabbitmq.service';
import { Express } from 'express';

@Injectable()
export class InsurancePolicyService {
  private readonly DEFAULT_CACHE_TTL = 1800; // 30分钟
  private readonly CACHE_KEY_PREFIX = 'insurance:policy';

  constructor(
    @InjectRepository(InsurancePolicy)
    private readonly insurancePolicyRepository: Repository<InsurancePolicy>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(PointsRecord)
    private readonly pointsRecordRepository: Repository<PointsRecord>,
    @InjectRepository(InsuranceCompany)
    private readonly insuranceCompanyRepository: Repository<InsuranceCompany>,
    @InjectRepository(InsuranceProduct)
    private readonly insuranceProductRepository: Repository<InsuranceProduct>,
    @InjectRepository(PolicyHolder)
    private readonly policyHolderRepository: Repository<PolicyHolder>,
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    private readonly cacheService: AdvancedCacheService,
    private readonly configService: ConfigService,
    private readonly rabbitMQService: RabbitMQService,
  ) {
    const insuranceCacheConfig = this.configService.get('performance.cache.modules.insurance');
    if (insuranceCacheConfig) {
      this.DEFAULT_CACHE_TTL = insuranceCacheConfig.ttl;
    }
  }

  private async clearPolicyCache(id?: string, policyNumber?: string): Promise<void> {
    // 清除保单列表缓存
    await this.cacheService.clearCache(`${this.CACHE_KEY_PREFIX}:list:*`);

    // 清除特定保单缓存
    if (id) {
      await this.cacheService.clearCache(`${this.CACHE_KEY_PREFIX}:${id}`);
    }

    // 清除按保单号查询的缓存
    if (policyNumber) {
      await this.cacheService.clearCache(`${this.CACHE_KEY_PREFIX}:number:${policyNumber}`);
    }
  }

  async create(createInsurancePolicyDto: CreateInsurancePolicyDto): Promise<InsurancePolicy> {
    // 暂时不关联memberId，实际应用中需要从请求中获取或通过投保人信息匹配
    const insurancePolicy = this.insurancePolicyRepository.create(createInsurancePolicyDto);
    const savedPolicy = await this.insurancePolicyRepository.save(insurancePolicy);

    // 保单生效时自动发放积分（1元保费=10积分）
    if (savedPolicy.policyStatus === 1) {
      await this.grantInsurancePoints(savedPolicy);
    }

    // 创建成功后清除相关缓存
    await this.clearPolicyCache(savedPolicy.id, savedPolicy.policyNumber);

    return savedPolicy;
  }

  async findAll(paginationDto: PaginationDto): Promise<{ data: InsurancePolicy[]; total: number }> {
    const { page = 1, pageSize = 10, keyword } = paginationDto;
    const cacheKey = `${this.CACHE_KEY_PREFIX}:list:page=${page}:size=${pageSize}:keyword=${keyword || 'null'}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        const queryBuilder = this.insurancePolicyRepository
          .createQueryBuilder('policy')
          .leftJoinAndSelect('policy.policyHolder', 'policyHolder')
          .leftJoinAndSelect('policy.insuranceCompany', 'insuranceCompany')
          .leftJoinAndSelect('policy.insuranceProduct', 'insuranceProduct')
          .leftJoinAndSelect('policy.channel', 'channel')
          .leftJoinAndSelect('policy.upstreamChannel', 'upstreamChannel');

        if (keyword) {
          queryBuilder.andWhere(
            'policy.policyNumber LIKE :keyword OR policyHolder.companyName LIKE :keyword OR policyHolder.holderName LIKE :keyword OR policyHolder.licensePlate LIKE :keyword',
            { keyword: `%${keyword}%` },
          );
        }

        const [data, total] = await queryBuilder
          .skip((page - 1) * pageSize)
          .take(pageSize)
          .orderBy('policy.createTime', 'DESC')
          .getManyAndCount();

        return { data, total };
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  async findOne(id: string): Promise<InsurancePolicy> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:${id}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        const insurancePolicy = await this.insurancePolicyRepository.findOne({
          where: { id },
          relations: [
            'policyHolder',
            'insuranceCompany',
            'insuranceProduct',
            'channel',
            'upstreamChannel',
          ],
        });

        if (!insurancePolicy) {
          throw new NotFoundException(`保单 ID ${id} 不存在`);
        }

        return insurancePolicy;
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  async findByPolicyNumber(policyNumber: string): Promise<InsurancePolicy | null> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:number:${policyNumber}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        return await this.insurancePolicyRepository.findOne({
          where: { policyNumber },
        });
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  async update(
    id: string,
    updateInsurancePolicyDto: UpdateInsurancePolicyDto,
  ): Promise<InsurancePolicy> {
    const insurancePolicy = await this.findOne(id);
    const oldStatus = insurancePolicy.policyStatus;
    const policyNumber = insurancePolicy.policyNumber;

    Object.assign(insurancePolicy, updateInsurancePolicyDto);
    const updatedPolicy = await this.insurancePolicyRepository.save(insurancePolicy);

    // 如果保单状态从其他状态变为生效状态，则发放积分
    if (oldStatus !== 1 && updatedPolicy.policyStatus === 1) {
      await this.grantInsurancePoints(updatedPolicy);
    }

    // 更新成功后清除相关缓存
    await this.clearPolicyCache(id, policyNumber);

    // 如果保单号发生变化，清除新保单号的缓存
    if (
      updateInsurancePolicyDto.policyNumber &&
      updateInsurancePolicyDto.policyNumber !== policyNumber
    ) {
      await this.clearPolicyCache(undefined, updateInsurancePolicyDto.policyNumber);
    }

    return updatedPolicy;
  }

  async remove(id: string): Promise<void> {
    const insurancePolicy = await this.findOne(id);
    const policyNumber = insurancePolicy.policyNumber;

    const result = await this.insurancePolicyRepository.update(id, { isDel: 1 });
    if (result.affected === 0) {
      throw new NotFoundException(`保单 ID ${id} 不存在`);
    }

    // 删除成功后清除相关缓存
    await this.clearPolicyCache(id, policyNumber);
  }

  async audit(
    id: string,
    auditStatus: number,
    auditBy: string,
    auditRemark?: string,
  ): Promise<InsurancePolicy> {
    const insurancePolicy = await this.findOne(id);
    const policyNumber = insurancePolicy.policyNumber;

    insurancePolicy.auditStatus = auditStatus;
    insurancePolicy.auditBy = auditBy;
    insurancePolicy.auditAt = new Date();
    insurancePolicy.auditRemark = auditRemark;

    const result = await this.insurancePolicyRepository.save(insurancePolicy);

    // 审核成功后清除相关缓存
    await this.clearPolicyCache(id, policyNumber);

    return result;
  }

  /**
   * 为保险业务发放积分
   * 规则：1元保费=10积分
   */
  private async grantInsurancePoints(policy: InsurancePolicy): Promise<void> {
    // 实际应用中，需要根据投保人信息匹配到会员ID
    // 这里为了演示，假设memberId为固定值，实际应该从保单关联的投保人信息中获取或通过其他方式匹配
    const memberId = 'demo-member-id'; // 实际应用中需要替换为真实的memberId获取逻辑

    // 查询会员信息
    const member = await this.memberRepository.findOne({ where: { id: memberId } });
    if (!member) {
      throw new NotFoundException(`会员 ID ${memberId} 不存在`);
    }

    // 计算积分：1元保费=10积分
    const points = Math.floor(policy.premium * 10);
    if (points <= 0) {
      return;
    }

    // 更新会员积分
    const newPoints = member.points + points;
    member.points = newPoints;
    await this.memberRepository.save(member);

    // 创建积分记录
    const pointsRecord = this.pointsRecordRepository.create({
      memberId: member.id,
      memberUsername: member.username,
      type: PointsRecordType.EARN,
      points: points,
      balance: newPoints,
      source: PointsRecordSource.INSURANCE,
      orderNo: policy.policyNumber,
      businessId: policy.id,
      businessDesc: `保险保单积分奖励：${policy.policyNumber}`,
      remark: `保费：${policy.premium}元，积分：${points}分`,
    });

    await this.pointsRecordRepository.save(pointsRecord);
  }

  /**
   * 批量导入保单数据（异步）
   * @param file 上传的Excel文件
   * @returns 导入任务ID
   */
  async batchImport(
    file: Express.Multer.File,
  ): Promise<{ taskId: string; message: string; totalRecords: number }> {
    if (!file) {
      throw new BadRequestException('文件不能为空');
    }

    // 解析Excel文件
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelData = XLSX.utils.sheet_to_json(worksheet);

    // 生成任务ID
    const taskId = `import_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // 发送消息到RabbitMQ队列
    const importData = {
      taskId,
      data: excelData,
      timestamp: new Date().toISOString(),
    };

    await this.rabbitMQService.emit('insurance.policy.batch_import', importData);

    return {
      taskId,
      message: '批量导入任务已提交，将异步处理',
      totalRecords: excelData.length,
    };
  }

  /**
   * 处理批量导入任务（由队列消费者调用）
   * @param importData 导入数据
   * @returns 导入结果
   */
  async processBatchImport(importData: {
    taskId: string;
    data: any[];
    timestamp: string;
  }): Promise<{ successCount: number; failedCount: number; failedReasons: string[] }> {
    const { data } = importData;
    let successCount = 0;
    let failedCount = 0;
    const failedReasons: string[] = [];

    // 处理每条数据
    for (let i = 0; i < data.length; i++) {
      try {
        const rowData = data[i];
        const rowIndex = i + 2; // Excel行号从2开始

        // 查找关联实体
        const insuranceCompany = await this.insuranceCompanyRepository.findOne({
          where: { companyName: rowData.保险公司 },
        });
        if (!insuranceCompany) {
          throw new Error(`第${rowIndex}行：保险公司"${rowData.保险公司}"不存在`);
        }

        const insuranceProduct = await this.insuranceProductRepository.findOne({
          where: { productName: rowData.保险产品 },
        });
        if (!insuranceProduct) {
          throw new Error(`第${rowIndex}行：保险产品"${rowData.保险产品}"不存在`);
        }

        // 查找或创建投保人
        let policyHolder = await this.policyHolderRepository.findOne({
          where: { licensePlate: rowData.车牌号 },
        });
        if (!policyHolder) {
          policyHolder = this.policyHolderRepository.create({
            holderName: rowData.投保人姓名,
            licensePlate: rowData.车牌号,
            phone: rowData.联系电话,
            companyName: rowData.单位名称 || '',
            contactPerson: rowData.联系人 || '',
            email: rowData.邮箱 || '',
            address: rowData.地址 || '',
          });
          policyHolder = await this.policyHolderRepository.save(policyHolder);
        }

        // 查找渠道
        const channel = await this.channelRepository.findOne({
          where: { channelName: rowData.销售渠道 },
        });
        if (!channel) {
          throw new Error(`第${rowIndex}行：销售渠道"${rowData.销售渠道}"不存在`);
        }

        // 查找上游渠道
        let upstreamChannel = null;
        if (rowData.上游渠道) {
          upstreamChannel = await this.channelRepository.findOne({
            where: { channelName: rowData.上游渠道 },
          });
          if (!upstreamChannel) {
            throw new Error(`第${rowIndex}行：上游渠道"${rowData.上游渠道}"不存在`);
          }
        }

        // 创建保单
        const insurancePolicy = this.insurancePolicyRepository.create({
          policyNumber: rowData.保单号,
          insuranceCompanyId: insuranceCompany.id,
          insuranceProductId: insuranceProduct.id,
          policyHolderId: policyHolder.id,
          channelId: channel.id,
          upstreamChannelId: upstreamChannel ? upstreamChannel.id : null,
          effectiveDate: new Date(rowData.生效日期),
          expiryDate: new Date(rowData.止保日期),
          premium: parseFloat(rowData.保费),
          policyStatus: parseInt(rowData.保单状态) || 0,
          auditStatus: parseInt(rowData.审核状态) || 0,
          downstreamPolicyRate: parseFloat(rowData.下游佣金率 || 0),
          upstreamPolicyRate: parseFloat(rowData.上游佣金率 || 0),
          taxIncluded: rowData.是否含税 === '是' ? 1 : 0,
          remarks: rowData.备注 || '',
        });

        // 保存保单
        const savedPolicy = await this.insurancePolicyRepository.save(insurancePolicy);

        // 保单生效时自动发放积分
        if (savedPolicy.policyStatus === 1) {
          await this.grantInsurancePoints(savedPolicy);
        }

        successCount++;
      } catch (error) {
        failedCount++;
        failedReasons.push((error as Error).message);
      }
    }

    // 批量导入完成后清除所有保单列表缓存
    await this.clearPolicyCache();

    return { successCount, failedCount, failedReasons };
  }
}
