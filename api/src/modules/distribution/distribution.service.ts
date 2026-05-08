import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Distributor, DistributorStatus } from './entities/distributor.entity';
import { CommissionRecord } from './entities/commission-record.entity';
import { CreateDistributorDto } from './dto/create-distributor.dto';
import { UpdateDistributorDto } from './dto/update-distributor.dto';
import { ErrorCode, getErrorMessage } from '../../shared/exceptions/error-code';
import { PaginatedResponse, PaginatedResponseDto } from '../../shared/dto/response.dto';

@Injectable()
export class DistributionService {
  private readonly logger = new Logger(DistributionService.name);

  constructor(
    @InjectRepository(Distributor)
    private readonly distributorRepository: Repository<Distributor>,
    @InjectRepository(CommissionRecord)
    private readonly commissionRecordRepository: Repository<CommissionRecord>,
  ) {}

  private generateInviteCode(): string {
    return 'DIST' + Date.now() + Math.floor(Math.random() * 1000);
  }

  async createDistributor(dto: CreateDistributorDto): Promise<Distributor> {
    const existDistributor = await this.distributorRepository.findOne({
      where: { userId: dto.userId },
    });

    if (existDistributor) {
      throw new ConflictException({
        code: ErrorCode.DIS_ALREADY_EXISTS,
        message: getErrorMessage(ErrorCode.DIS_ALREADY_EXISTS),
      });
    }

    if (dto.inviterId) {
      const inviter = await this.distributorRepository.findOne({
        where: { userId: dto.inviterId },
      });
      if (!inviter) {
        throw new BadRequestException({
          code: ErrorCode.DIS_INVITE_CODE_INVALID,
          message: '邀请人不存在',
        });
      }
    }

    const distributor = this.distributorRepository.create({
      ...dto,
      inviteCode: this.generateInviteCode(),
      status: DistributorStatus.PENDING,
    });

    const result = await this.distributorRepository.save(distributor);
    this.logger.log(`分销商创建成功: ${result.id}`, 'DistributionService');
    return result;
  }

  async findAll(query: any): Promise<PaginatedResponse<Distributor>> {
    const { page = 1, limit = 10, status, keyword } = query;

    const where: any = {};
    if (status !== undefined) where.status = status;
    if (keyword) {
      where.distributorName = Like(`%${keyword}%`);
    }

    const result = (await this.distributorRepository.find({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    })) as any;

    return PaginatedResponseDto.create(
      result[0] as Distributor[],
      result[1] as number,
      page,
      limit,
    );
  }

  async findById(id: string): Promise<Distributor> {
    const distributor = await this.distributorRepository.findOne({
      where: { id },
    });

    if (!distributor) {
      throw new NotFoundException({
        code: ErrorCode.DIS_NOT_FOUND,
        message: getErrorMessage(ErrorCode.DIS_NOT_FOUND),
      });
    }

    return distributor;
  }

  async findByUserId(userId: string): Promise<Distributor> {
    const distributor = await this.distributorRepository.findOne({
      where: { userId },
    });

    if (!distributor) {
      throw new NotFoundException({
        code: ErrorCode.DIS_NOT_FOUND,
        message: getErrorMessage(ErrorCode.DIS_NOT_FOUND),
      });
    }

    return distributor;
  }

  async findByInviteCode(inviteCode: string): Promise<Distributor> {
    const distributor = await this.distributorRepository.findOne({
      where: { inviteCode },
    });

    if (!distributor) {
      throw new NotFoundException({
        code: ErrorCode.DIS_INVITE_CODE_INVALID,
        message: getErrorMessage(ErrorCode.DIS_INVITE_CODE_INVALID),
      });
    }

    return distributor;
  }

  async updateDistributor(id: string, dto: UpdateDistributorDto): Promise<Distributor> {
    const distributor = await this.findById(id);

    if (dto.status !== undefined) {
      distributor.status = dto.status;
      distributor.auditTime = new Date();
    }

    Object.assign(distributor, dto);

    const result = await this.distributorRepository.save(distributor);
    this.logger.log(`分销商更新成功: ${id}`, 'DistributionService');
    return result;
  }

  async deleteDistributor(id: string): Promise<void> {
    await this.findById(id);
    await this.distributorRepository.softDelete({ id });
    this.logger.log(`分销商删除成功: ${id}`, 'DistributionService');
  }

  async findCommissionRecords(
    distributorId: string,
    query: any,
  ): Promise<PaginatedResponse<CommissionRecord>> {
    const { page = 1, limit = 10, status } = query;

    const where: any = { distributorId };
    if (status !== undefined) where.status = status;

    const result = (await this.commissionRecordRepository.find({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    })) as any;

    return PaginatedResponseDto.create(
      result[0] as CommissionRecord[],
      result[1] as number,
      page,
      limit,
    );
  }

  async applyWithdraw(distributorId: string, amount: number): Promise<Distributor> {
    const distributor = await this.findById(distributorId);

    if (distributor.availableCommission < amount) {
      throw new BadRequestException({
        code: ErrorCode.DIS_WITHDRAW_AMOUNT_INVALID,
        message: '可用佣金不足',
      });
    }

    distributor.availableCommission -= amount;
    distributor.frozenCommission += amount;

    return await this.distributorRepository.save(distributor);
  }

  async getDistributors(
    page: number,
    pageSize: number,
    status?: number,
  ): Promise<PaginatedResponse<Distributor>> {
    return this.findAll({ page, limit: pageSize, status });
  }

  async getDistributorById(id: string): Promise<Distributor> {
    return this.findById(id);
  }

  async getDistributorByUserId(userId: string): Promise<Distributor> {
    return this.findByUserId(userId);
  }

  async getCommissionRecords(
    distributorId?: string,
    status?: number,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<PaginatedResponse<CommissionRecord>> {
    return this.findCommissionRecords(distributorId, { page, limit: pageSize, status });
  }

  async getCommissionRecordById(id: string): Promise<CommissionRecord> {
    const record = await this.commissionRecordRepository.findOne({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException({
        code: ErrorCode.COMMISSION_NOT_FOUND,
        message: getErrorMessage(ErrorCode.COMMISSION_NOT_FOUND),
      });
    }

    return record;
  }
}
