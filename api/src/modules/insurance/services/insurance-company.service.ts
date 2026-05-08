import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InsuranceCompany } from '../entities/insurance-company.entity';
import { CreateInsuranceCompanyDto } from '../dto/create-insurance-company.dto';
import { UpdateInsuranceCompanyDto } from '../dto/update-insurance-company.dto';
import { PaginationDto } from '@shared/dto/common.dto';
import { AdvancedCacheService } from '@infrastructure/cache/advanced-cache.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InsuranceCompanyService {
  private readonly DEFAULT_CACHE_TTL = 3600; // 1小时
  private readonly CACHE_KEY_PREFIX = 'insurance:company';

  constructor(
    @InjectRepository(InsuranceCompany)
    private readonly insuranceCompanyRepository: Repository<InsuranceCompany>,
    private readonly cacheService: AdvancedCacheService,
    private readonly configService: ConfigService,
  ) {
    const insuranceCacheConfig = this.configService.get('performance.cache.modules.insurance');
    if (insuranceCacheConfig) {
      this.DEFAULT_CACHE_TTL = insuranceCacheConfig.ttl;
    }
  }

  private async clearCompanyCache(id?: string, companyCode?: string): Promise<void> {
    // 清除保险公司列表缓存
    await this.cacheService.clearCache(`${this.CACHE_KEY_PREFIX}:list:*`);

    // 清除特定保险公司缓存
    if (id) {
      await this.cacheService.clearCache(`${this.CACHE_KEY_PREFIX}:${id}`);
    }

    // 清除按代码查询的缓存
    if (companyCode) {
      await this.cacheService.clearCache(`${this.CACHE_KEY_PREFIX}:code:${companyCode}`);
    }
  }

  async create(createInsuranceCompanyDto: CreateInsuranceCompanyDto): Promise<InsuranceCompany> {
    const insuranceCompany = this.insuranceCompanyRepository.create(createInsuranceCompanyDto);
    const result = await this.insuranceCompanyRepository.save(insuranceCompany);

    // 创建成功后清除列表缓存
    await this.clearCompanyCache();

    return result;
  }

  async findAll(paginationDto: any): Promise<{ data: InsuranceCompany[]; total: number }> {
    const { page = 1, pageSize = 10, keyword, cooperationStatus, status } = paginationDto;
    // 暂时禁用缓存，以便调试
    // const cacheKey = `${this.CACHE_KEY_PREFIX}:list:page=${page}:size=${pageSize}:keyword=${keyword || 'null'}:cooperationStatus=${cooperationStatus || 'null'}:status=${status || 'null'}`;

    // return await this.cacheService.readThrough(
    //   cacheKey,
    //   async () => {
    console.log('开始查询保险公司列表，参数:', {
      page,
      pageSize,
      keyword,
      cooperationStatus,
      status,
    });
    const queryBuilder = this.insuranceCompanyRepository.createQueryBuilder('company');

    // 暂时注释掉删除标记过滤条件，以便调试
    // queryBuilder.andWhere('company.isDel = :isDel', { isDel: 0 });
    console.log('暂时注释掉删除标记过滤条件');

    if (keyword) {
      queryBuilder.andWhere(
        'company.companyName LIKE :keyword OR company.shortName LIKE :keyword OR company.companyCode LIKE :keyword',
        { keyword: `%${keyword}%` },
      );
      console.log('添加关键词过滤条件:', keyword);
    }

    if (cooperationStatus !== undefined) {
      queryBuilder.andWhere('company.cooperationStatus = :cooperationStatus', {
        cooperationStatus,
      });
      console.log('添加合作状态过滤条件:', cooperationStatus);
    }

    if (status !== undefined) {
      // 将各种类型的 status 值转换为数字：true/"true" -> 1, false/"false" -> 0
      let statusNum: number;
      if (typeof status === 'boolean') {
        statusNum = status ? 1 : 0;
      } else if (typeof status === 'string') {
        statusNum = status.toLowerCase() === 'true' ? 1 : 0;
      } else {
        statusNum = Number(status) || 0;
      }
      queryBuilder.andWhere('company.status = :status', { status: statusNum });
      console.log('添加启用状态过滤条件:', { original: status, converted: statusNum });
    }

    // 打印最终的SQL查询语句
    const sql = queryBuilder.getSql();
    console.log('最终的SQL查询语句:', sql);

    // 尝试直接查询所有数据，不使用分页和排序
    const allData = await this.insuranceCompanyRepository.find();
    console.log('直接查询所有数据的结果:', { count: allData.length, data: allData });

    const [data, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('company.sortOrder', 'ASC')
      .addOrderBy('company.createTime', 'DESC')
      .getManyAndCount();

    console.log('查询结果:', { data, total });

    return { data, total };
    // },
    // this.DEFAULT_CACHE_TTL,
    // );
  }

  async findOne(id: string): Promise<InsuranceCompany> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:${id}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        const insuranceCompany = await this.insuranceCompanyRepository.findOne({
          where: { id, isDel: 0 },
        });

        if (!insuranceCompany) {
          throw new NotFoundException(`保险公司 ID ${id} 不存在`);
        }

        return insuranceCompany;
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  async findByCode(companyCode: string): Promise<InsuranceCompany | null> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:code:${companyCode}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        return await this.insuranceCompanyRepository.findOne({
          where: { companyCode, isDel: 0 },
        });
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  async update(
    id: string,
    updateInsuranceCompanyDto: UpdateInsuranceCompanyDto,
  ): Promise<InsuranceCompany> {
    // 直接查询保险公司，不过滤 isDel 字段
    const insuranceCompany = await this.insuranceCompanyRepository.findOne({
      where: { id },
    });

    if (!insuranceCompany) {
      throw new NotFoundException(`保险公司 ID ${id} 不存在`);
    }

    const oldCompanyCode = insuranceCompany.companyCode;

    Object.assign(insuranceCompany, updateInsuranceCompanyDto);
    const result = await this.insuranceCompanyRepository.save(insuranceCompany);

    // 更新成功后清除相关缓存
    await this.clearCompanyCache(id, oldCompanyCode);

    // 如果公司代码发生变化，清除新代码的缓存
    if (
      updateInsuranceCompanyDto.companyCode &&
      updateInsuranceCompanyDto.companyCode !== oldCompanyCode
    ) {
      await this.clearCompanyCache(undefined, updateInsuranceCompanyDto.companyCode);
    }

    return result;
  }

  async remove(id: string): Promise<void> {
    // 直接查询保险公司，不过滤 isDel 字段
    const insuranceCompany = await this.insuranceCompanyRepository.findOne({
      where: { id },
    });

    if (!insuranceCompany) {
      throw new NotFoundException(`保险公司 ID ${id} 不存在`);
    }

    const companyCode = insuranceCompany.companyCode;

    insuranceCompany.isDel = 1;
    await this.insuranceCompanyRepository.save(insuranceCompany);

    // 删除成功后清除相关缓存
    await this.clearCompanyCache(id, companyCode);
  }
}
