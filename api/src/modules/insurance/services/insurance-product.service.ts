import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InsuranceProduct } from '../entities/insurance-product.entity';
import { CreateInsuranceProductDto } from '../dto/create-insurance-product.dto';
import { UpdateInsuranceProductDto } from '../dto/update-insurance-product.dto';
import { PaginationDto } from '@shared/dto/common.dto';
import { AdvancedCacheService } from '@infrastructure/cache/advanced-cache.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InsuranceProductService {
  private readonly DEFAULT_CACHE_TTL = 3600; // 1小时
  private readonly CACHE_KEY_PREFIX = 'insurance:product';

  constructor(
    @InjectRepository(InsuranceProduct)
    private readonly insuranceProductRepository: Repository<InsuranceProduct>,
    private readonly cacheService: AdvancedCacheService,
    private readonly configService: ConfigService,
  ) {
    const insuranceCacheConfig = this.configService.get('performance.cache.modules.insurance');
    if (insuranceCacheConfig) {
      this.DEFAULT_CACHE_TTL = insuranceCacheConfig.ttl;
    }
  }

  private async clearProductCache(
    id?: string,
    companyId?: string,
    productCode?: string,
  ): Promise<void> {
    // 清除保险产品列表缓存
    await this.cacheService.clearCache(`${this.CACHE_KEY_PREFIX}:list:*`);

    // 清除特定保险产品缓存
    if (id) {
      await this.cacheService.clearCache(`${this.CACHE_KEY_PREFIX}:${id}`);
    }

    // 清除按代码查询的缓存
    if (productCode) {
      await this.cacheService.clearCache(`${this.CACHE_KEY_PREFIX}:code:${productCode}`);
    }

    // 清除按公司查询的缓存
    if (companyId) {
      await this.cacheService.clearCache(`${this.CACHE_KEY_PREFIX}:company:${companyId}`);
    }
  }

  async create(createInsuranceProductDto: CreateInsuranceProductDto): Promise<InsuranceProduct> {
    const {
      productCode,
      productName,
      insuranceType,
      description,
      companyId,
      price,
      upstreamPolicy,
      upstreamCommission,
      downstreamPolicy,
      downstreamCommission,
      taxDeductible,
      status,
      sortOrder,
    } = createInsuranceProductDto;

    const insuranceProduct = this.insuranceProductRepository.create({
      productCode,
      productName,
      insuranceType,
      description,
      companyId,
      price,
      upstreamPolicy,
      upstreamCommission,
      downstreamPolicy,
      downstreamCommission,
      taxDeductible,
      status,
      sortOrder,
    });

    const result = await this.insuranceProductRepository.save(insuranceProduct);

    // 创建成功后清除相关缓存
    await this.clearProductCache(undefined, companyId);

    return result;
  }

  async findAll(paginationDto: any): Promise<{ data: InsuranceProduct[]; total: number }> {
    const { page = 1, pageSize = 10, keyword, name, companyId, status } = paginationDto;
    const cacheKey = `${this.CACHE_KEY_PREFIX}:list:page=${page}:size=${pageSize}:keyword=${keyword || 'null'}:name=${name || 'null'}:companyId=${companyId || 'null'}:status=${status || 'null'}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        const queryBuilder = this.insuranceProductRepository
          .createQueryBuilder('product')
          .leftJoinAndSelect('product.company', 'company')
          .where('product.isDel = 0');

        if (keyword) {
          queryBuilder.andWhere(
            'product.productName LIKE :keyword OR product.productCode LIKE :keyword',
            { keyword: `%${keyword}%` },
          );
        }

        if (name) {
          queryBuilder.andWhere('product.productName LIKE :name', { name: `%${name}%` });
        }

        if (companyId) {
          queryBuilder.andWhere('product.companyId = :companyId', { companyId });
        }

        if (status !== undefined && status !== '') {
          // 将各种类型的 status 值转换为数字：true/"true" -> 1, false/"false" -> 0
          let statusNum: number;
          if (typeof status === 'boolean') {
            statusNum = status ? 1 : 0;
          } else if (typeof status === 'string') {
            if (status.toLowerCase() === 'true') {
              statusNum = 1;
            } else if (status.toLowerCase() === 'false') {
              statusNum = 0;
            } else {
              // 尝试将字符串转换为数字，如果转换失败则忽略
              const parsedStatus = Number(status);
              if (!isNaN(parsedStatus)) {
                statusNum = parsedStatus;
              } else {
                // 如果转换失败，不添加状态过滤条件
                statusNum = undefined;
              }
            }
          } else {
            statusNum = Number(status) || 0;
          }

          // 只有当statusNum不是undefined时才添加过滤条件
          if (statusNum !== undefined) {
            queryBuilder.andWhere('product.status = :status', { status: statusNum });
          }
        }

        const [data, total] = await queryBuilder
          .skip((page - 1) * pageSize)
          .take(pageSize)
          .orderBy('product.sortOrder', 'ASC')
          .addOrderBy('product.createTime', 'DESC')
          .getManyAndCount();

        return { data, total };
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  async findOne(id: string): Promise<InsuranceProduct> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:${id}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        const insuranceProduct = await this.insuranceProductRepository.findOne({
          where: { id },
          relations: ['company'],
        });

        if (!insuranceProduct) {
          throw new NotFoundException(`保险产品 ID ${id} 不存在`);
        }

        return insuranceProduct;
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  async findByCode(productCode: string): Promise<InsuranceProduct | null> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:code:${productCode}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        return await this.insuranceProductRepository.findOne({
          where: { productCode },
        });
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  async findByCompany(companyId: string): Promise<InsuranceProduct[]> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:company:${companyId}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        return await this.insuranceProductRepository.find({
          where: { companyId, status: 1 },
          order: { sortOrder: 'ASC' },
        });
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  async update(
    id: string,
    updateInsuranceProductDto: UpdateInsuranceProductDto,
  ): Promise<InsuranceProduct> {
    const insuranceProduct = await this.findOne(id);
    const oldCompanyId = insuranceProduct.companyId;
    const oldProductCode = insuranceProduct.productCode;

    Object.assign(insuranceProduct, updateInsuranceProductDto);
    const result = await this.insuranceProductRepository.save(insuranceProduct);

    // 更新成功后清除相关缓存
    await this.clearProductCache(id, oldCompanyId, oldProductCode);

    // 如果公司ID或产品代码发生变化，清除新值的缓存
    if (updateInsuranceProductDto.companyId) {
      await this.clearProductCache(undefined, updateInsuranceProductDto.companyId?.toString());
    }
    if (
      updateInsuranceProductDto.productCode &&
      updateInsuranceProductDto.productCode !== oldProductCode
    ) {
      await this.clearProductCache(undefined, undefined, updateInsuranceProductDto.productCode);
    }

    return result;
  }

  async remove(id: string): Promise<void> {
    const insuranceProduct = await this.findOne(id);
    const companyId = insuranceProduct.companyId;
    const productCode = insuranceProduct.productCode;

    insuranceProduct.isDel = 1;
    await this.insuranceProductRepository.save(insuranceProduct);

    // 删除成功后清除相关缓存
    await this.clearProductCache(id, companyId, productCode);
  }
}
