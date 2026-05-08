import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InsuranceCompanyService } from './insurance-company.service';
import { InsuranceCompany } from '../entities/insurance-company.entity';
import { CreateInsuranceCompanyDto } from '../dto/create-insurance-company.dto';
import { UpdateInsuranceCompanyDto } from '../dto/update-insurance-company.dto';
import { AdvancedCacheService } from '@infrastructure/cache/advanced-cache.service';
import { ConfigService } from '@nestjs/config';

interface MockRepository<T> {
  find: jest.Mock;
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  createQueryBuilder: jest.Mock;
}

class InsuranceCompanyRepositoryMock implements MockRepository<InsuranceCompany> {
  find = jest.fn();
  findOne = jest.fn();
  create = jest.fn();
  save = jest.fn();
  update = jest.fn();
  delete = jest.fn();
  createQueryBuilder = jest.fn();
}

interface MockCacheService {
  readThrough: jest.Mock;
  writeThrough: jest.Mock;
  clearCache: jest.Mock;
}

class AdvancedCacheServiceMock implements MockCacheService {
  readThrough = jest.fn();
  writeThrough = jest.fn();
  clearCache = jest.fn();
}

interface MockConfigService {
  get: jest.Mock;
}

class ConfigServiceMock implements MockConfigService {
  get = jest.fn();
}

describe('InsuranceCompanyService', () => {
  let service: InsuranceCompanyService;
  let repository: Repository<InsuranceCompany>;

  const mockInsuranceCompany = {
    id: '1',
    companyCode: 'ABC123',
    companyName: '测试保险公司',
    shortName: '测试保险',
    contactPerson: '张三',
    contactPhone: '13800138000',
    address: '北京市朝阳区',
    cooperationStatus: 1,

    settlementPeriod: 30,
    bankAccount: '6222021234567890123',
    bankName: '中国工商银行',
    taxNumber: '91110000710936708T',
    remarks: '合作良好',
    sortOrder: 1,
    status: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    isDel: 0,
  } as unknown as InsuranceCompany;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsuranceCompanyService,
        {
          provide: getRepositoryToken(InsuranceCompany),
          useClass: InsuranceCompanyRepositoryMock,
        },
        {
          provide: AdvancedCacheService,
          useClass: AdvancedCacheServiceMock,
        },
        {
          provide: ConfigService,
          useClass: ConfigServiceMock,
        },
      ],
    }).compile();

    service = module.get<InsuranceCompanyService>(InsuranceCompanyService);
    repository = module.get<Repository<InsuranceCompany>>(getRepositoryToken(InsuranceCompany));

    // 重写readThrough方法以直接调用传入的函数
    const cacheService = module.get(AdvancedCacheService);
    (cacheService.readThrough as jest.Mock).mockImplementation(
      async (key, fn: () => Promise<any>) => {
        return await fn();
      },
    );

    // 配置ConfigService以返回默认的缓存配置
    const configService = module.get(ConfigService);
    (configService.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'performance.cache.modules.insurance') {
        return { ttl: 1800, maxSize: 5000 };
      }
      return null;
    });
  });

  it('应该被定义', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('应该创建新的保险公司', async () => {
      const createDto: CreateInsuranceCompanyDto = {
        companyCode: 'IC001',
        companyName: '中国平安保险有限公司',
        shortName: '平安保险',
      };

      jest.spyOn(repository, 'create').mockReturnValue(mockInsuranceCompany as any);
      jest.spyOn(repository, 'save').mockResolvedValue(mockInsuranceCompany);

      const result = await service.create(createDto);
      expect(result).toEqual(mockInsuranceCompany);
    });
  });

  describe('findAll', () => {
    it('应该返回保险公司列表', async () => {
      const mockInsuranceCompanies = [mockInsuranceCompany];
      jest.spyOn(repository, 'createQueryBuilder').mockImplementation(() => {
        const mockQueryBuilder = {
          andWhere: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          addOrderBy: jest.fn().mockReturnThis(),
          getManyAndCount: jest
            .fn()
            .mockResolvedValue([mockInsuranceCompanies, mockInsuranceCompanies.length]),
        };
        return mockQueryBuilder as any;
      });

      const result = await service.findAll({ page: 1, pageSize: 10 });
      expect(result).toEqual({
        data: mockInsuranceCompanies,
        total: mockInsuranceCompanies.length,
      });
    });
  });

  describe('findOne', () => {
    it('应该返回单个保险公司', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockInsuranceCompany);

      const result = await service.findOne('1');
      expect(result).toEqual(mockInsuranceCompany);
    });

    it('保险公司不存在时应该抛出NotFoundException', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow('保险公司 ID 999 不存在');
    });
  });

  describe('findByCode', () => {
    it('应该根据代码返回保险公司', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockInsuranceCompany);

      const result = await service.findByCode('IC001');
      expect(result).toEqual(mockInsuranceCompany);
    });
  });

  describe('update', () => {
    it('应该更新保险公司信息', async () => {
      const updateDto: UpdateInsuranceCompanyDto = { companyName: '更新后的保险公司名称' };
      const updatedInsuranceCompany = { ...mockInsuranceCompany, ...updateDto };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockInsuranceCompany);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedInsuranceCompany);

      const result = await service.update('1', updateDto);
      expect(result).toEqual(updatedInsuranceCompany);
    });
  });

  describe('remove', () => {
    it('应该软删除保险公司', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockInsuranceCompany);
      jest.spyOn(repository, 'save').mockResolvedValue(mockInsuranceCompany);

      await expect(service.remove('1')).resolves.not.toThrow();
    });

    it('保险公司不存在时应该抛出NotFoundException', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow('保险公司 ID 999 不存在');
    });
  });
});
