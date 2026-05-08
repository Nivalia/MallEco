import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ClaimRecord } from '../entities/claim-record.entity';
import { CreateClaimRecordDto } from '../dto/create-claim-record.dto';
import { UpdateClaimRecordDto } from '../dto/update-claim-record.dto';
import { PaginationDto } from '@shared/dto/common.dto';
import { InsurancePolicy } from '../entities/insurance-policy.entity';
import { InsuranceCompany } from '../entities/insurance-company.entity';
import { PolicyHolder } from '../entities/policy-holder.entity';
import { AdvancedCacheService } from '@infrastructure/cache/advanced-cache.service';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from '@infrastructure/rabbitmq/rabbitmq.service';

@Injectable()
export class ClaimRecordService {
  private readonly DEFAULT_CACHE_TTL = 1800; // 30分钟
  private readonly CACHE_KEY_PREFIX = 'insurance:claim';

  constructor(
    @InjectRepository(ClaimRecord)
    private readonly claimRecordRepository: Repository<ClaimRecord>,
    @InjectRepository(InsurancePolicy)
    private readonly insurancePolicyRepository: Repository<InsurancePolicy>,
    @InjectRepository(InsuranceCompany)
    private readonly insuranceCompanyRepository: Repository<InsuranceCompany>,
    @InjectRepository(PolicyHolder)
    private readonly policyHolderRepository: Repository<PolicyHolder>,
    private readonly cacheService: AdvancedCacheService,
    private readonly configService: ConfigService,
    private readonly rabbitMQService: RabbitMQService,
  ) {
    const insuranceCacheConfig = this.configService.get('performance.cache.modules.insurance');
    if (insuranceCacheConfig) {
      this.DEFAULT_CACHE_TTL = insuranceCacheConfig.ttl;
    }
  }

  private async clearClaimCache(id?: string, claimNumber?: string): Promise<void> {
    // 清除理赔列表缓存
    await this.cacheService.clearCache(`${this.CACHE_KEY_PREFIX}:list:*`);

    // 清除特定理赔缓存
    if (id) {
      await this.cacheService.clearCache(`${this.CACHE_KEY_PREFIX}:${id}`);
    }

    // 清除按理赔号查询的缓存
    if (claimNumber) {
      await this.cacheService.clearCache(`${this.CACHE_KEY_PREFIX}:number:${claimNumber}`);
    }
  }

  /**
   * 生成理赔单号
   * 格式：CLM + 年月日 + 6位随机数
   */
  private generateClaimNumber(): string {
    const date = new Date();
    const dateStr =
      date.getFullYear().toString() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0');
    const randomStr = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    return `CLM${dateStr}${randomStr}`;
  }

  async create(createClaimRecordDto: CreateClaimRecordDto): Promise<ClaimRecord> {
    // 验证关联数据存在性
    const policy = await this.insurancePolicyRepository.findOne({
      where: { id: createClaimRecordDto.policyId },
    });
    if (!policy) {
      throw new BadRequestException('关联保单不存在');
    }

    const company = await this.insuranceCompanyRepository.findOne({
      where: { id: createClaimRecordDto.insuranceCompanyId },
    });
    if (!company) {
      throw new BadRequestException('保险公司不存在');
    }

    const holder = await this.policyHolderRepository.findOne({
      where: { id: createClaimRecordDto.policyHolderId },
    });
    if (!holder) {
      throw new BadRequestException('投保人不存在');
    }

    // 生成理赔单号
    const claimNumber = createClaimRecordDto.claimNumber || this.generateClaimNumber();

    // 创建理赔记录
    const claimRecord = this.claimRecordRepository.create({
      ...createClaimRecordDto,
      claimNumber,
      claimStatus: createClaimRecordDto.claimStatus || 0,
    });

    const savedClaim = await this.claimRecordRepository.save(claimRecord);

    // 发送理赔创建消息
    await this.rabbitMQService.emit('insurance.claim.created', {
      claimId: savedClaim.id,
      claimNumber: savedClaim.claimNumber,
      policyId: savedClaim.policyId,
      policyNumber: policy.policyNumber,
    });

    // 创建成功后清除相关缓存
    await this.clearClaimCache(savedClaim.id, savedClaim.claimNumber);

    return savedClaim;
  }

  async findAll(paginationDto: PaginationDto): Promise<{ data: ClaimRecord[]; total: number }> {
    const { page = 1, pageSize = 10, keyword } = paginationDto;
    const cacheKey = `${this.CACHE_KEY_PREFIX}:list:page=${page}:size=${pageSize}:keyword=${keyword || 'null'}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        const queryBuilder = this.claimRecordRepository
          .createQueryBuilder('claim')
          .leftJoinAndSelect('claim.policy', 'policy')
          .leftJoinAndSelect('claim.insuranceCompany', 'company')
          .leftJoinAndSelect('claim.policyHolder', 'holder');

        if (keyword) {
          queryBuilder.andWhere(
            'claim.claimNumber LIKE :keyword OR policy.policyNumber LIKE :keyword OR company.companyName LIKE :keyword OR holder.holderName LIKE :keyword',
            { keyword: `%${keyword}%` },
          );
        }

        const [data, total] = await queryBuilder
          .skip((page - 1) * pageSize)
          .take(pageSize)
          .orderBy('claim.createTime', 'DESC')
          .getManyAndCount();

        return { data, total };
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  async findOne(id: string): Promise<ClaimRecord> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:${id}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        const claimRecord = await this.claimRecordRepository.findOne({
          where: { id },
          relations: ['policy', 'insuranceCompany', 'policyHolder'],
        });

        if (!claimRecord) {
          throw new NotFoundException(`理赔记录 ID ${id} 不存在`);
        }

        return claimRecord;
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  async findByClaimNumber(claimNumber: string): Promise<ClaimRecord | null> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:number:${claimNumber}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        return await this.claimRecordRepository.findOne({
          where: { claimNumber },
          relations: ['policy', 'insuranceCompany', 'policyHolder'],
        });
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  async update(id: string, updateClaimRecordDto: UpdateClaimRecordDto): Promise<ClaimRecord> {
    const claimRecord = await this.findOne(id);
    const oldStatus = claimRecord.claimStatus;
    const claimNumber = claimRecord.claimNumber;

    // 验证关联数据存在性（如果更新了关联ID）
    if (updateClaimRecordDto.policyId && updateClaimRecordDto.policyId !== claimRecord.policyId) {
      const policy = await this.insurancePolicyRepository.findOne({
        where: { id: updateClaimRecordDto.policyId },
      });
      if (!policy) {
        throw new BadRequestException('关联保单不存在');
      }
    }

    if (
      updateClaimRecordDto.insuranceCompanyId &&
      updateClaimRecordDto.insuranceCompanyId !== claimRecord.insuranceCompanyId
    ) {
      const company = await this.insuranceCompanyRepository.findOne({
        where: { id: updateClaimRecordDto.insuranceCompanyId },
      });
      if (!company) {
        throw new BadRequestException('保险公司不存在');
      }
    }

    if (
      updateClaimRecordDto.policyHolderId &&
      updateClaimRecordDto.policyHolderId !== claimRecord.policyHolderId
    ) {
      const holder = await this.policyHolderRepository.findOne({
        where: { id: updateClaimRecordDto.policyHolderId },
      });
      if (!holder) {
        throw new BadRequestException('投保人不存在');
      }
    }

    // 更新理赔记录
    Object.assign(claimRecord, updateClaimRecordDto);

    // 如果理赔状态变为已完成，计算处理时长
    if (claimRecord.claimStatus === 2 && oldStatus !== 2) {
      claimRecord.processEndDate = new Date();
      if (claimRecord.processStartDate) {
        const startDate = new Date(claimRecord.processStartDate);
        const endDate = new Date(claimRecord.processEndDate);
        claimRecord.processingTime = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        );
      }
    }

    // 如果理赔状态变为处理中，设置处理开始日期
    if (claimRecord.claimStatus === 1 && oldStatus !== 1) {
      claimRecord.processStartDate = new Date();
    }

    const updatedClaim = await this.claimRecordRepository.save(claimRecord);

    // 发送状态变更消息
    await this.rabbitMQService.emit('insurance.claim.status_changed', {
      claimId: updatedClaim.id,
      claimNumber: updatedClaim.claimNumber,
      oldStatus,
      newStatus: updatedClaim.claimStatus,
    });

    // 更新成功后清除相关缓存
    await this.clearClaimCache(id, claimNumber);

    // 如果理赔号发生变化，清除新理赔号的缓存
    if (updateClaimRecordDto.claimNumber && updateClaimRecordDto.claimNumber !== claimNumber) {
      await this.clearClaimCache(undefined, updateClaimRecordDto.claimNumber);
    }

    return updatedClaim;
  }

  async remove(id: string): Promise<void> {
    const claimRecord = await this.findOne(id);
    const claimNumber = claimRecord.claimNumber;

    const result = await this.claimRecordRepository.update(id, { isDel: 1 });
    if (result.affected === 0) {
      throw new NotFoundException(`理赔记录 ID ${id} 不存在`);
    }

    // 删除成功后清除相关缓存
    await this.clearClaimCache(id, claimNumber);
  }

  async processClaim(
    id: string,
    status: number,
    handlerId: string,
    handlerName: string,
    statusDescription?: string,
  ): Promise<ClaimRecord> {
    const claimRecord = await this.findOne(id);

    claimRecord.claimStatus = status;
    claimRecord.handlerId = handlerId;
    claimRecord.handlerName = handlerName;
    claimRecord.statusDescription = statusDescription;

    // 更新处理时间
    if (status === 1) {
      claimRecord.processStartDate = new Date();
    } else if (status === 2 || status === 3) {
      claimRecord.processEndDate = new Date();
      if (claimRecord.processStartDate) {
        const startDate = new Date(claimRecord.processStartDate);
        const endDate = new Date(claimRecord.processEndDate);
        claimRecord.processingTime = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        );
      }
    }

    const updatedClaim = await this.claimRecordRepository.save(claimRecord);

    // 发送处理消息
    await this.rabbitMQService.emit('insurance.claim.processed', {
      claimId: updatedClaim.id,
      claimNumber: updatedClaim.claimNumber,
      status,
      handlerId,
      handlerName,
    });

    // 清除缓存
    await this.clearClaimCache(id, updatedClaim.claimNumber);

    return updatedClaim;
  }

  async audit(
    id: string,
    auditStatus: number,
    auditBy: string,
    auditRemark?: string,
  ): Promise<ClaimRecord> {
    const claimRecord = await this.findOne(id);
    const claimNumber = claimRecord.claimNumber;

    claimRecord.auditStatus = auditStatus;
    claimRecord.auditBy = auditBy;
    claimRecord.auditAt = new Date();
    claimRecord.auditRemark = auditRemark;

    const result = await this.claimRecordRepository.save(claimRecord);

    // 审核成功后清除相关缓存
    await this.clearClaimCache(id, claimNumber);

    return result;
  }

  async findByPolicyId(policyId: string): Promise<ClaimRecord[]> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:policy:${policyId}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        return await this.claimRecordRepository.find({
          where: { policyId },
          relations: ['insuranceCompany', 'policyHolder'],
          order: { createTime: 'DESC' },
        });
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  async getClaimStatistics(): Promise<object> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:statistics`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        // 总理赔数
        const totalClaims = await this.claimRecordRepository.count({ where: { isDel: 0 } });

        // 各状态理赔数
        const statusCounts = await this.claimRecordRepository
          .createQueryBuilder('claim')
          .select('claim.claimStatus, COUNT(*) as count')
          .where('claim.isDel = 0')
          .groupBy('claim.claimStatus')
          .getRawMany();

        // 总理赔金额
        const totalClaimAmount = await this.claimRecordRepository
          .createQueryBuilder('claim')
          .select('COALESCE(SUM(claim.claimAmount), 0) as totalAmount')
          .where('claim.isDel = 0')
          .getRawOne();

        // 总赔付金额
        const totalPaymentAmount = await this.claimRecordRepository
          .createQueryBuilder('claim')
          .select('COALESCE(SUM(claim.paymentAmount), 0) as totalPayment')
          .where('claim.isDel = 0 AND claim.paymentAmount IS NOT NULL')
          .getRawOne();

        return {
          totalClaims,
          statusCounts,
          totalClaimAmount: parseFloat(totalClaimAmount.totalAmount || '0'),
          totalPaymentAmount: parseFloat(totalPaymentAmount.totalPayment || '0'),
        };
      },
      this.DEFAULT_CACHE_TTL,
    );
  }
}
