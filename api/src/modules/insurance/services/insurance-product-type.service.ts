import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InsuranceProductType } from '../entities/insurance-product-type.entity';
import { CreateInsuranceProductTypeDto } from '../dto/create-insurance-product-type.dto';
import { UpdateInsuranceProductTypeDto } from '../dto/update-insurance-product-type.dto';
import { PaginationDto } from '@shared/dto/common.dto';

@Injectable()
export class InsuranceProductTypeService {
  constructor(
    @InjectRepository(InsuranceProductType)
    private readonly insuranceProductTypeRepository: Repository<InsuranceProductType>,
  ) {}

  /**
   * 创建保险产品类型
   */
  async create(
    createInsuranceProductTypeDto: CreateInsuranceProductTypeDto,
  ): Promise<InsuranceProductType> {
    // 检查类型编码是否已存在（包括软删除的记录）
    const existingType = await this.insuranceProductTypeRepository.findOne({
      where: { typeCode: createInsuranceProductTypeDto.typeCode },
    });

    if (existingType) {
      if (existingType.isDel === 0) {
        // 如果已存在且未删除，抛出冲突异常
        throw new ConflictException(`类型编码 ${createInsuranceProductTypeDto.typeCode} 已存在`);
      } else {
        // 如果已存在但已删除，恢复它
        existingType.isDel = 0;
        existingType.typeName = createInsuranceProductTypeDto.typeName;
        existingType.description =
          createInsuranceProductTypeDto.description || existingType.description;
        existingType.sortOrder = createInsuranceProductTypeDto.sortOrder || existingType.sortOrder;
        existingType.status = createInsuranceProductTypeDto.status || existingType.status;
        return this.insuranceProductTypeRepository.save(existingType);
      }
    }

    // 创建新的产品类型
    const newType = this.insuranceProductTypeRepository.create({
      ...createInsuranceProductTypeDto,
      sortOrder: createInsuranceProductTypeDto.sortOrder || 0,
      status: createInsuranceProductTypeDto.status || 1,
    });

    return this.insuranceProductTypeRepository.save(newType);
  }

  /**
   * 查询保险产品类型列表
   */
  async findAll(
    paginationDto?: PaginationDto,
  ): Promise<{ data: InsuranceProductType[]; total: number }> {
    const queryBuilder = this.insuranceProductTypeRepository
      .createQueryBuilder('type')
      .where('type.isDel = 0');

    // 添加排序
    queryBuilder.orderBy('type.sortOrder', 'ASC').addOrderBy('type.createTime', 'DESC');

    // 处理分页
    if (paginationDto) {
      const { page = 1, pageSize = 10 } = paginationDto;
      const total = await queryBuilder.getCount();
      const data = await queryBuilder
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getMany();

      return { data, total };
    } else {
      // 如果没有分页参数，返回所有数据
      const data = await queryBuilder.getMany();
      const total = data.length;

      return { data, total };
    }
  }

  /**
   * 根据ID查询保险产品类型
   */
  async findOne(id: string): Promise<InsuranceProductType> {
    const productType = await this.insuranceProductTypeRepository.findOne({
      where: { id, isDel: 0 },
    });

    if (!productType) {
      throw new NotFoundException(`产品类型 ${id} 不存在`);
    }

    return productType;
  }

  /**
   * 根据类型编码查询保险产品类型
   */
  async findByCode(typeCode: string): Promise<InsuranceProductType> {
    const productType = await this.insuranceProductTypeRepository.findOne({
      where: { typeCode, isDel: 0 },
    });

    if (!productType) {
      throw new NotFoundException(`产品类型 ${typeCode} 不存在`);
    }

    return productType;
  }

  /**
   * 更新保险产品类型
   */
  async update(
    id: string,
    updateInsuranceProductTypeDto: UpdateInsuranceProductTypeDto,
  ): Promise<InsuranceProductType> {
    const productType = await this.findOne(id);

    // 如果要更新类型编码，检查新编码是否已存在
    if (
      updateInsuranceProductTypeDto.typeCode &&
      updateInsuranceProductTypeDto.typeCode !== productType.typeCode
    ) {
      const existingType = await this.insuranceProductTypeRepository.findOne({
        where: { typeCode: updateInsuranceProductTypeDto.typeCode, isDel: 0 },
      });

      if (existingType) {
        throw new ConflictException(`类型编码 ${updateInsuranceProductTypeDto.typeCode} 已存在`);
      }
    }

    // 更新产品类型
    Object.assign(productType, updateInsuranceProductTypeDto);

    return this.insuranceProductTypeRepository.save(productType);
  }

  /**
   * 删除保险产品类型（软删除）
   */
  async remove(id: string): Promise<InsuranceProductType> {
    const productType = await this.findOne(id);

    // 软删除
    productType.isDel = 1;

    return this.insuranceProductTypeRepository.save(productType);
  }
}
