import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PolicyHolder } from '../entities/policy-holder.entity';
import { CreatePolicyHolderDto } from '../dto/create-policy-holder.dto';
import { UpdatePolicyHolderDto } from '../dto/update-policy-holder.dto';
import { PaginationDto } from '@shared/dto/common.dto';

@Injectable()
export class PolicyHolderService {
  constructor(
    @InjectRepository(PolicyHolder)
    private readonly policyHolderRepository: Repository<PolicyHolder>,
  ) {}

  async create(createPolicyHolderDto: CreatePolicyHolderDto): Promise<PolicyHolder> {
    const policyHolder = this.policyHolderRepository.create(createPolicyHolderDto);
    return await this.policyHolderRepository.save(policyHolder);
  }

  async findAll(paginationDto: PaginationDto): Promise<{ data: PolicyHolder[]; total: number }> {
    const { page = 1, pageSize = 10, keyword } = paginationDto;

    const queryBuilder = this.policyHolderRepository.createQueryBuilder('holder');

    if (keyword) {
      queryBuilder.andWhere(
        'holder.companyName LIKE :keyword OR holder.holderName LIKE :keyword OR holder.contactPerson LIKE :keyword OR holder.phone LIKE :keyword OR holder.licensePlate LIKE :keyword',
        { keyword: `%${keyword}%` },
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('holder.createTime', 'DESC')
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<PolicyHolder> {
    const policyHolder = await this.policyHolderRepository.findOne({
      where: { id },
    });

    if (!policyHolder) {
      throw new NotFoundException(`投保人 ID ${id} 不存在`);
    }

    return policyHolder;
  }

  async findByLicensePlate(licensePlate: string): Promise<PolicyHolder | null> {
    return await this.policyHolderRepository.findOne({
      where: { licensePlate },
    });
  }

  async findByPhone(phone: string): Promise<PolicyHolder | null> {
    return await this.policyHolderRepository.findOne({
      where: { phone },
    });
  }

  async update(id: string, updatePolicyHolderDto: UpdatePolicyHolderDto): Promise<PolicyHolder> {
    const policyHolder = await this.findOne(id);

    Object.assign(policyHolder, updatePolicyHolderDto);
    return await this.policyHolderRepository.save(policyHolder);
  }

  async remove(id: string): Promise<void> {
    const result = await this.policyHolderRepository.update(id, { isDel: 1 });
    if (result.affected === 0) {
      throw new NotFoundException(`投保人 ID ${id} 不存在`);
    }
  }
}
