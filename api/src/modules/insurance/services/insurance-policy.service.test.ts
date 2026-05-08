import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InsurancePolicyService } from './insurance-policy.service';
import { InsurancePolicy } from '../entities/insurance-policy.entity';
import { PolicyHolder } from '../entities/policy-holder.entity';
import { InsuranceCompany } from '../entities/insurance-company.entity';
import { InsuranceProduct } from '../entities/insurance-product.entity';
import { Channel } from '../entities/channel.entity';
import { Member } from '@modules/framework/entities/member.entity';
import { PointsRecord } from '@modules/framework/entities/points-record.entity';
import { CreateInsurancePolicyDto } from '../dto/create-insurance-policy.dto';
import { UpdateInsurancePolicyDto } from '../dto/update-insurance-policy.dto';
import { PaginationDto } from '@shared/dto/common.dto';
import { AdvancedCacheService } from '@infrastructure/cache/advanced-cache.service';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from '@infrastructure/rabbitmq/rabbitmq.service';

// Mock数据
const mockInsurancePolicy = {
  id: '1',
  policyNumber: 'P001',
  policyHolderId: 'holder1',
  insuranceCompanyId: 'company1',
  insuranceProductId: 'product1',
  channelId: 'channel1',
  effectiveDate: new Date('2026-01-01'),
  expiryDate: new Date('2027-01-01'),
  premium: 1000,
  policyStatus: 1,
  auditStatus: 1,
  createTime: new Date('2026-01-01'),
  updateTime: new Date('2026-01-01'),
  isDel: 0,
};

const mockPolicyHolder = {
  id: 'holder1',
  holderName: '张三',
  licensePlate: '京A12345',
  phone: '13800138000',
};

const mockInsuranceCompany = {
  id: 'company1',
  companyName: '保险公司A',
};

const mockInsuranceProduct = {
  id: 'product1',
  productName: '车险产品',
};

const mockChannel = {
  id: 'channel1',
  channelName: '渠道A',
};

const mockMember = {
  id: 'member1',
  username: 'member1',
  points: 0,
};

// Mock Repositories
const mockInsurancePolicyRepository: Partial<Record<keyof Repository<InsurancePolicy>, jest.Mock>> =
  {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    })),
  };

const mockPolicyHolderRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockInsuranceCompanyRepository = {
  findOne: jest.fn(),
};

const mockInsuranceProductRepository = {
  findOne: jest.fn(),
};

const mockChannelRepository = {
  findOne: jest.fn(),
};

const mockMemberRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
};

const mockPointsRecordRepository = {
  create: jest.fn(),
  save: jest.fn(),
};

// Mock Services
const mockAdvancedCacheService = {
  readThrough: jest.fn(async (key: string, fn: () => Promise<any>) => {
    return await fn();
  }),
  clearCache: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(() => null),
};

const mockRabbitMQService = {
  emit: jest.fn(),
  send: jest.fn(),
};

describe('InsurancePolicyService', () => {
  let service: InsurancePolicyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsurancePolicyService,
        {
          provide: getRepositoryToken(InsurancePolicy),
          useValue: mockInsurancePolicyRepository,
        },
        {
          provide: getRepositoryToken(PolicyHolder),
          useValue: mockPolicyHolderRepository,
        },
        {
          provide: getRepositoryToken(InsuranceCompany),
          useValue: mockInsuranceCompanyRepository,
        },
        {
          provide: getRepositoryToken(InsuranceProduct),
          useValue: mockInsuranceProductRepository,
        },
        {
          provide: getRepositoryToken(Channel),
          useValue: mockChannelRepository,
        },
        {
          provide: getRepositoryToken(Member),
          useValue: mockMemberRepository,
        },
        {
          provide: getRepositoryToken(PointsRecord),
          useValue: mockPointsRecordRepository,
        },
        {
          provide: AdvancedCacheService,
          useValue: mockAdvancedCacheService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: RabbitMQService,
          useValue: mockRabbitMQService,
        },
      ],
    }).compile();

    service = module.get<InsurancePolicyService>(InsurancePolicyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new insurance policy', async () => {
      const createDto: CreateInsurancePolicyDto = {
        policyNumber: 'P001',
        policyHolderId: 'holder1',
        insuranceCompanyId: 'company1',
        insuranceProductId: 'product1',
        channelId: 'channel1',
        effectiveDate: new Date('2026-01-01'),
        expiryDate: new Date('2027-01-01'),
        premium: 1000,
        policyStatus: 1,
        insuranceType: 'personal',
      };

      mockInsurancePolicyRepository.create.mockReturnValue(mockInsurancePolicy);
      mockInsurancePolicyRepository.save.mockResolvedValue(mockInsurancePolicy);
      mockMemberRepository.findOne.mockResolvedValue(mockMember);
      mockMemberRepository.save.mockResolvedValue({ ...mockMember, points: 10000 });
      mockPointsRecordRepository.create.mockReturnValue({});
      mockPointsRecordRepository.save.mockResolvedValue({});

      const result = await service.create(createDto);

      expect(mockInsurancePolicyRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockInsurancePolicyRepository.save).toHaveBeenCalledWith(mockInsurancePolicy);
      expect(result).toEqual(mockInsurancePolicy);
    });
  });

  describe('findAll', () => {
    it('should return paginated insurance policies', async () => {
      const paginationDto = new PaginationDto();
      paginationDto.page = 1;
      paginationDto.pageSize = 10;
      const mockPolicies = [mockInsurancePolicy];

      // 创建一个模拟的queryBuilder对象
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockPolicies, 1]),
      };

      // 模拟createQueryBuilder返回这个queryBuilder对象
      mockInsurancePolicyRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll(paginationDto);

      expect(result).toEqual({
        data: mockPolicies,
        total: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should return an insurance policy by ID', async () => {
      mockInsurancePolicyRepository.findOne.mockResolvedValue(mockInsurancePolicy);

      const result = await service.findOne('1');

      expect(result).toEqual(mockInsurancePolicy);
      expect(mockInsurancePolicyRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: [
          'policyHolder',
          'insuranceCompany',
          'insuranceProduct',
          'channel',
          'upstreamChannel',
        ],
      });
    });

    it('should throw NotFoundException if insurance policy not found', async () => {
      mockInsurancePolicyRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an insurance policy', async () => {
      const updateDto: UpdateInsurancePolicyDto = {
        premium: 1200,
      };

      mockInsurancePolicyRepository.findOne.mockResolvedValue(mockInsurancePolicy);
      mockInsurancePolicyRepository.save.mockResolvedValue({
        ...mockInsurancePolicy,
        ...updateDto,
      });

      const result = await service.update('1', updateDto);

      expect(mockInsurancePolicyRepository.findOne).toHaveBeenCalledWith({
        relations: [
          'policyHolder',
          'insuranceCompany',
          'insuranceProduct',
          'channel',
          'upstreamChannel',
        ],
        where: { id: '1' },
      });
      expect(mockInsurancePolicyRepository.save).toHaveBeenCalledWith({
        ...mockInsurancePolicy,
        ...updateDto,
      });
      expect(result).toEqual({ ...mockInsurancePolicy, ...updateDto });
    });

    it('should throw NotFoundException if insurance policy not found', async () => {
      const updateDto: UpdateInsurancePolicyDto = {
        premium: 1200,
      };

      mockInsurancePolicyRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an insurance policy', async () => {
      mockInsurancePolicyRepository.findOne.mockResolvedValue(mockInsurancePolicy);
      mockInsurancePolicyRepository.update.mockResolvedValue({ affected: 1 });

      await service.remove('1');

      expect(mockInsurancePolicyRepository.findOne).toHaveBeenCalledWith({
        relations: [
          'policyHolder',
          'insuranceCompany',
          'insuranceProduct',
          'channel',
          'upstreamChannel',
        ],
        where: { id: '1' },
      });
      expect(mockInsurancePolicyRepository.update).toHaveBeenCalledWith('1', { isDel: 1 });
    });

    it('should throw NotFoundException if insurance policy not found', async () => {
      mockInsurancePolicyRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('audit', () => {
    it('should audit an insurance policy', async () => {
      mockInsurancePolicyRepository.findOne.mockResolvedValue(mockInsurancePolicy);
      mockInsurancePolicyRepository.save.mockResolvedValue({
        ...mockInsurancePolicy,
        auditStatus: 1,
        auditBy: 'user1',
        auditAt: expect.any(Date),
      });

      const result = await service.audit('1', 1, 'user1', '审核通过');

      expect(result.auditStatus).toBe(1);
      expect(result.auditBy).toBe('user1');
      expect(result.auditAt).toBeDefined();
    });

    it('should throw NotFoundException if insurance policy not found', async () => {
      mockInsurancePolicyRepository.findOne.mockResolvedValue(null);

      await expect(service.audit('non-existent', 1, 'user1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('batchImport', () => {
    it('should throw BadRequestException if file is empty', async () => {
      await expect(service.batchImport(null as any)).rejects.toThrow(BadRequestException);
    });

    // 这里可以添加更多关于batchImport方法的测试用例
  });
});
