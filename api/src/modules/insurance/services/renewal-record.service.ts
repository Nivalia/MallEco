import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { RenewalRecord } from '../entities/renewal-record.entity';
import { CreateRenewalRecordDto } from '../dto/create-renewal-record.dto';
import { UpdateRenewalRecordDto } from '../dto/update-renewal-record.dto';
import { PaginationDto } from '@shared/dto/common.dto';
import { InsurancePolicy } from '../entities/insurance-policy.entity';
import { InsuranceCompany } from '../entities/insurance-company.entity';
import { PolicyHolder } from '../entities/policy-holder.entity';
import { InsuranceProduct } from '../entities/insurance-product.entity';
import { AdvancedCacheService } from '@infrastructure/cache/advanced-cache.service';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from '@infrastructure/rabbitmq/rabbitmq.service';

@Injectable()
export class RenewalRecordService {
  private readonly DEFAULT_CACHE_TTL = 1800; // 30分钟
  private readonly CACHE_KEY_PREFIX = 'insurance:renewal';

  constructor(
    @InjectRepository(RenewalRecord)
    private readonly renewalRecordRepository: Repository<RenewalRecord>,
    @InjectRepository(InsurancePolicy)
    private readonly insurancePolicyRepository: Repository<InsurancePolicy>,
    @InjectRepository(InsuranceCompany)
    private readonly insuranceCompanyRepository: Repository<InsuranceCompany>,
    @InjectRepository(PolicyHolder)
    private readonly policyHolderRepository: Repository<PolicyHolder>,
    @InjectRepository(InsuranceProduct)
    private readonly insuranceProductRepository: Repository<InsuranceProduct>,
    private readonly cacheService: AdvancedCacheService,
    private readonly configService: ConfigService,
    private readonly rabbitMQService: RabbitMQService,
  ) {
    const insuranceCacheConfig = this.configService.get('performance.cache.modules.insurance');
    if (insuranceCacheConfig) {
      this.DEFAULT_CACHE_TTL = insuranceCacheConfig.ttl;
    }
  }

  private async clearRenewalCache(id?: string, renewalNumber?: string): Promise<void> {
    // 清除续保列表缓存
    await this.cacheService.clearCache(`${this.CACHE_KEY_PREFIX}:list:*`);

    // 清除特定续保缓存
    if (id) {
      await this.cacheService.clearCache(`${this.CACHE_KEY_PREFIX}:${id}`);
    }

    // 清除按续保单号查询的缓存
    if (renewalNumber) {
      await this.cacheService.clearCache(`${this.CACHE_KEY_PREFIX}:number:${renewalNumber}`);
    }
  }

  /**
   * 生成续保单号
   * 格式：REN + 年月日 + 6位随机数
   */
  private generateRenewalNumber(): string {
    const date = new Date();
    const dateStr =
      date.getFullYear().toString() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0');
    const randomStr = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    return `REN${dateStr}${randomStr}`;
  }

  async create(createRenewalRecordDto: CreateRenewalRecordDto): Promise<RenewalRecord> {
    // 验证关联数据存在性
    const originalPolicy = await this.insurancePolicyRepository.findOne({
      where: { id: createRenewalRecordDto.originalPolicyId },
    });
    if (!originalPolicy) {
      throw new BadRequestException('原保单不存在');
    }

    const newPolicy = await this.insurancePolicyRepository.findOne({
      where: { id: createRenewalRecordDto.policyId },
    });
    if (!newPolicy) {
      throw new BadRequestException('新保单不存在');
    }

    const company = await this.insuranceCompanyRepository.findOne({
      where: { id: createRenewalRecordDto.insuranceCompanyId },
    });
    if (!company) {
      throw new BadRequestException('保险公司不存在');
    }

    const holder = await this.policyHolderRepository.findOne({
      where: { id: createRenewalRecordDto.policyHolderId },
    });
    if (!holder) {
      throw new BadRequestException('投保人不存在');
    }

    if (createRenewalRecordDto.insuranceProductId) {
      const product = await this.insuranceProductRepository.findOne({
        where: { id: createRenewalRecordDto.insuranceProductId },
      });
      if (!product) {
        throw new BadRequestException('保险产品不存在');
      }
    }

    // 生成续保单号
    const renewalNumber = createRenewalRecordDto.renewalNumber || this.generateRenewalNumber();

    // 创建续保记录
    const renewalRecord = this.renewalRecordRepository.create({
      ...createRenewalRecordDto,
      renewalNumber,
      renewalStatus: createRenewalRecordDto.renewalStatus || 0,
    });

    const savedRenewal = await this.renewalRecordRepository.save(renewalRecord);

    // 发送续保创建消息
    await this.rabbitMQService.emit('insurance.renewal.created', {
      renewalId: savedRenewal.id,
      renewalNumber: savedRenewal.renewalNumber,
      originalPolicyId: savedRenewal.originalPolicyId,
      policyId: savedRenewal.policyId,
    });

    // 创建成功后清除相关缓存
    await this.clearRenewalCache(savedRenewal.id, savedRenewal.renewalNumber);

    return savedRenewal;
  }

  async findAll(paginationDto: PaginationDto): Promise<{ data: RenewalRecord[]; total: number }> {
    const { page = 1, pageSize = 10, keyword } = paginationDto;
    const cacheKey = `${this.CACHE_KEY_PREFIX}:list:page=${page}:size=${pageSize}:keyword=${keyword || 'null'}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        const queryBuilder = this.renewalRecordRepository
          .createQueryBuilder('renewal')
          .leftJoinAndSelect('renewal.policy', 'policy')
          .leftJoinAndSelect('renewal.originalPolicy', 'originalPolicy')
          .leftJoinAndSelect('renewal.insuranceCompany', 'company')
          .leftJoinAndSelect('renewal.policyHolder', 'holder')
          .leftJoinAndSelect('renewal.insuranceProduct', 'product');

        if (keyword) {
          queryBuilder.andWhere(
            'renewal.renewalNumber LIKE :keyword OR policy.policyNumber LIKE :keyword OR originalPolicy.policyNumber LIKE :keyword OR company.companyName LIKE :keyword OR holder.holderName LIKE :keyword',
            { keyword: `%${keyword}%` },
          );
        }

        const [data, total] = await queryBuilder
          .skip((page - 1) * pageSize)
          .take(pageSize)
          .orderBy('renewal.createTime', 'DESC')
          .getManyAndCount();

        return { data, total };
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  async findOne(id: string): Promise<RenewalRecord> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:${id}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        const renewalRecord = await this.renewalRecordRepository.findOne({
          where: { id },
          relations: [
            'policy',
            'originalPolicy',
            'insuranceCompany',
            'policyHolder',
            'insuranceProduct',
          ],
        });

        if (!renewalRecord) {
          throw new NotFoundException(`续保记录 ID ${id} 不存在`);
        }

        return renewalRecord;
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  async findByRenewalNumber(renewalNumber: string): Promise<RenewalRecord | null> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:number:${renewalNumber}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        return await this.renewalRecordRepository.findOne({
          where: { renewalNumber },
          relations: [
            'policy',
            'originalPolicy',
            'insuranceCompany',
            'policyHolder',
            'insuranceProduct',
          ],
        });
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  async update(id: string, updateRenewalRecordDto: UpdateRenewalRecordDto): Promise<RenewalRecord> {
    const renewalRecord = await this.findOne(id);
    const oldStatus = renewalRecord.renewalStatus;
    const renewalNumber = renewalRecord.renewalNumber;

    // 验证关联数据存在性（如果更新了关联ID）
    if (
      updateRenewalRecordDto.originalPolicyId &&
      updateRenewalRecordDto.originalPolicyId !== renewalRecord.originalPolicyId
    ) {
      const originalPolicy = await this.insurancePolicyRepository.findOne({
        where: { id: updateRenewalRecordDto.originalPolicyId },
      });
      if (!originalPolicy) {
        throw new BadRequestException('原保单不存在');
      }
    }

    if (
      updateRenewalRecordDto.policyId &&
      updateRenewalRecordDto.policyId !== renewalRecord.policyId
    ) {
      const newPolicy = await this.insurancePolicyRepository.findOne({
        where: { id: updateRenewalRecordDto.policyId },
      });
      if (!newPolicy) {
        throw new BadRequestException('新保单不存在');
      }
    }

    if (
      updateRenewalRecordDto.insuranceCompanyId &&
      updateRenewalRecordDto.insuranceCompanyId !== renewalRecord.insuranceCompanyId
    ) {
      const company = await this.insuranceCompanyRepository.findOne({
        where: { id: updateRenewalRecordDto.insuranceCompanyId },
      });
      if (!company) {
        throw new BadRequestException('保险公司不存在');
      }
    }

    if (
      updateRenewalRecordDto.policyHolderId &&
      updateRenewalRecordDto.policyHolderId !== renewalRecord.policyHolderId
    ) {
      const holder = await this.policyHolderRepository.findOne({
        where: { id: updateRenewalRecordDto.policyHolderId },
      });
      if (!holder) {
        throw new BadRequestException('投保人不存在');
      }
    }

    if (
      updateRenewalRecordDto.insuranceProductId &&
      updateRenewalRecordDto.insuranceProductId !== renewalRecord.insuranceProductId
    ) {
      const product = await this.insuranceProductRepository.findOne({
        where: { id: updateRenewalRecordDto.insuranceProductId },
      });
      if (!product) {
        throw new BadRequestException('保险产品不存在');
      }
    }

    // 更新续保记录
    Object.assign(renewalRecord, updateRenewalRecordDto);

    // 如果续保状态变为已完成，设置处理结束日期
    if (renewalRecord.renewalStatus === 2 && oldStatus !== 2) {
      renewalRecord.processEndDate = new Date();
    }

    // 如果续保状态变为处理中，设置处理开始日期
    if (renewalRecord.renewalStatus === 1 && oldStatus !== 1) {
      renewalRecord.processStartDate = new Date();
    }

    const updatedRenewal = await this.renewalRecordRepository.save(renewalRecord);

    // 发送状态变更消息
    await this.rabbitMQService.emit('insurance.renewal.status_changed', {
      renewalId: updatedRenewal.id,
      renewalNumber: updatedRenewal.renewalNumber,
      oldStatus,
      newStatus: updatedRenewal.renewalStatus,
    });

    // 更新成功后清除相关缓存
    await this.clearRenewalCache(id, renewalNumber);

    // 如果续保单号发生变化，清除新续保单号的缓存
    if (
      updateRenewalRecordDto.renewalNumber &&
      updateRenewalRecordDto.renewalNumber !== renewalNumber
    ) {
      await this.clearRenewalCache(undefined, updateRenewalRecordDto.renewalNumber);
    }

    return updatedRenewal;
  }

  async remove(id: string): Promise<void> {
    const renewalRecord = await this.findOne(id);
    const renewalNumber = renewalRecord.renewalNumber;

    const result = await this.renewalRecordRepository.update(id, { isDel: 1 });
    if (result.affected === 0) {
      throw new NotFoundException(`续保记录 ID ${id} 不存在`);
    }

    // 删除成功后清除相关缓存
    await this.clearRenewalCache(id, renewalNumber);
  }

  async processRenewal(
    id: string,
    status: number,
    handlerId: string,
    handlerName: string,
    statusDescription?: string,
  ): Promise<RenewalRecord> {
    const renewalRecord = await this.findOne(id);

    renewalRecord.renewalStatus = status;
    renewalRecord.handlerId = handlerId;
    renewalRecord.handlerName = handlerName;
    renewalRecord.statusDescription = statusDescription;

    // 更新处理时间
    if (status === 1) {
      renewalRecord.processStartDate = new Date();
    } else if (status === 2 || status === 3) {
      renewalRecord.processEndDate = new Date();
    }

    const updatedRenewal = await this.renewalRecordRepository.save(renewalRecord);

    // 发送处理消息
    await this.rabbitMQService.emit('insurance.renewal.processed', {
      renewalId: updatedRenewal.id,
      renewalNumber: updatedRenewal.renewalNumber,
      status,
      handlerId,
      handlerName,
    });

    // 清除缓存
    await this.clearRenewalCache(id, updatedRenewal.renewalNumber);

    return updatedRenewal;
  }

  async audit(
    id: string,
    auditStatus: number,
    auditBy: string,
    auditRemark?: string,
  ): Promise<RenewalRecord> {
    const renewalRecord = await this.findOne(id);
    const renewalNumber = renewalRecord.renewalNumber;

    renewalRecord.auditStatus = auditStatus;
    renewalRecord.auditBy = auditBy;
    renewalRecord.auditAt = new Date();
    renewalRecord.auditRemark = auditRemark;

    const result = await this.renewalRecordRepository.save(renewalRecord);

    // 审核成功后清除相关缓存
    await this.clearRenewalCache(id, renewalNumber);

    return result;
  }

  async findByOriginalPolicyId(originalPolicyId: string): Promise<RenewalRecord[]> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:original-policy:${originalPolicyId}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        return await this.renewalRecordRepository.find({
          where: { originalPolicyId },
          relations: ['policy', 'insuranceCompany', 'policyHolder'],
          order: { createTime: 'DESC' },
        });
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  async findByPolicyId(policyId: string): Promise<RenewalRecord | null> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:policy:${policyId}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        return await this.renewalRecordRepository.findOne({
          where: { policyId },
          relations: ['originalPolicy', 'insuranceCompany', 'policyHolder'],
        });
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  async getRenewalStatistics(): Promise<object> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:statistics`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        // 总续保数
        const totalRenewals = await this.renewalRecordRepository.count({ where: { isDel: 0 } });

        // 各状态续保数
        const statusCounts = await this.renewalRecordRepository
          .createQueryBuilder('renewal')
          .select('renewal.renewalStatus, COUNT(*) as count')
          .where('renewal.isDel = 0')
          .groupBy('renewal.renewalStatus')
          .getRawMany();

        // 总续保保费
        const totalPremium = await this.renewalRecordRepository
          .createQueryBuilder('renewal')
          .select('COALESCE(SUM(renewal.premium), 0) as totalPremium')
          .where('renewal.isDel = 0')
          .getRawOne();

        // 总保费变化
        const totalPremiumChange = await this.renewalRecordRepository
          .createQueryBuilder('renewal')
          .select('COALESCE(SUM(renewal.premiumChange), 0) as totalChange')
          .where('renewal.isDel = 0')
          .getRawOne();

        return {
          totalRenewals,
          statusCounts,
          totalPremium: parseFloat(totalPremium.totalPremium || '0'),
          totalPremiumChange: parseFloat(totalPremiumChange.totalChange || '0'),
        };
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  async getExpiringPolicies(days: number = 30): Promise<InsurancePolicy[]> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:expiring:${days}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        const today = new Date();
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);

        return await this.insurancePolicyRepository
          .createQueryBuilder('policy')
          .where('policy.expiryDate >= :today', { today })
          .andWhere('policy.expiryDate <= :targetDate', { targetDate })
          .andWhere('policy.policyStatus = :policyStatus', { policyStatus: 1 })
          .andWhere('policy.isDel = :isDel', { isDel: 0 })
          .leftJoinAndSelect('policy.insuranceCompany', 'insuranceCompany')
          .leftJoinAndSelect('policy.policyHolder', 'policyHolder')
          .orderBy('policy.expiryDate', 'ASC')
          .getMany();
      },
      this.DEFAULT_CACHE_TTL,
    );
  }
}
