import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InsuranceStatisticsService } from './insurance-statistics.service';
import { InsurancePolicy } from '../entities/insurance-policy.entity';
import { SettlementRecord } from '../entities/settlement-record.entity';
import { InsuranceCompany } from '../entities/insurance-company.entity';
import { Channel } from '../entities/channel.entity';
import { AdvancedCacheService } from '@infrastructure/cache/advanced-cache.service';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from '@infrastructure/rabbitmq/rabbitmq.service';

// Mock数据
const mockInsurancePolicies = [
  {
    id: '1',
    policyNumber: 'P001',
    effectiveDate: new Date('2026-01-01'),
    expiryDate: new Date('2027-01-01'),
    premium: 1000,
    insuranceCompanyId: 'company1',
    channelId: 'channel1',
    createTime: new Date('2026-01-01'),
  },
  {
    id: '2',
    policyNumber: 'P002',
    effectiveDate: new Date('2026-01-05'),
    expiryDate: new Date('2027-01-05'),
    premium: 2000,
    insuranceCompanyId: 'company1',
    channelId: 'channel2',
    createTime: new Date('2026-01-05'),
  },
  {
    id: '3',
    policyNumber: 'P003',
    effectiveDate: new Date('2026-02-01'),
    expiryDate: new Date('2027-02-01'),
    premium: 1500,
    insuranceCompanyId: 'company2',
    channelId: 'channel1',
    createTime: new Date('2026-02-01'),
  },
];

const mockSettlementRecords = [
  {
    id: '1',
    settlementNumber: 'S001',
    status: 2,
    totalCommission: 500,
    taxAmount: 30,
    netAmount: 470,
    createTime: new Date('2026-01-10'),
  },
  {
    id: '2',
    settlementNumber: 'S002',
    status: 3,
    totalCommission: 800,
    taxAmount: 48,
    netAmount: 752,
    createTime: new Date('2026-01-15'),
  },
];

// Mock Repositories
const mockInsurancePolicyRepository = {
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
  })),
};

const mockSettlementRecordRepository = {
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
  })),
};

const mockInsuranceCompanyRepository = {
  // 不需要实现，因为我们没有直接使用它的方法
};

const mockChannelRepository = {
  // 不需要实现，因为我们没有直接使用它的方法
};

// Mock Services
const mockAdvancedCacheService = {
  readThrough: jest.fn(async (key: string, fn: () => Promise<any>) => {
    // 直接调用回调函数，绕过缓存逻辑
    return await fn();
  }),
  clearCache: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(() => null), // 默认返回null，不覆盖默认缓存配置
};

// Mock RabbitMQService
const mockRabbitMQService = {
  emit: jest.fn(),
};

describe('InsuranceStatisticsService', () => {
  let service: InsuranceStatisticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsuranceStatisticsService,
        {
          provide: getRepositoryToken(InsurancePolicy),
          useValue: mockInsurancePolicyRepository,
        },
        {
          provide: getRepositoryToken(SettlementRecord),
          useValue: mockSettlementRecordRepository,
        },
        {
          provide: getRepositoryToken(InsuranceCompany),
          useValue: mockInsuranceCompanyRepository,
        },
        {
          provide: getRepositoryToken(Channel),
          useValue: mockChannelRepository,
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

    service = module.get<InsuranceStatisticsService>(InsuranceStatisticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBusinessStatistics', () => {
    it('should return business statistics correctly', async () => {
      // Mock数据
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      mockInsurancePolicyRepository.count.mockImplementation(options => {
        if (options.where.effectiveDate && options.where.effectiveDate._type === 'between') {
          return Promise.resolve(2); // 符合日期范围的保单数
        } else if (
          options.where.effectiveDate &&
          options.where.effectiveDate._type === 'lessThanOrEqual' &&
          options.where.expiryDate &&
          options.where.expiryDate._type === 'moreThanOrEqual'
        ) {
          return Promise.resolve(3); // 有效保单数
        }
        return Promise.resolve(0);
      });

      // 为保险政策查询构建器设置返回值
      const mockPremiumQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ totalPremium: '3000' }),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      mockInsurancePolicyRepository.createQueryBuilder.mockReturnValue(mockPremiumQueryBuilder);

      // 为结算记录查询构建器设置返回值
      const mockCommissionQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ totalCommission: '1300', totalNetAmount: '1222' }),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      mockSettlementRecordRepository.createQueryBuilder.mockReturnValue(mockCommissionQueryBuilder);

      // 调用服务方法
      const result = await service.getBusinessStatistics(startDate, endDate);

      // 验证结果
      expect(result).toEqual({
        totalPolicies: 2,
        activePolicies: 3,
        totalPremium: 3000,
        totalCommission: 1300,
        totalNetAmount: 1222,
      });
    });
  });

  describe('getPremiumTrend', () => {
    it('should return premium trend by day correctly', async () => {
      // Mock数据
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');
      const period = 'day';

      // 为保险政策查询构建器设置返回值
      const mockTrendQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({}),
        getRawMany: jest.fn().mockResolvedValue([
          { period: '2026-01-01', policyCount: '1', totalPremium: '1000' },
          { period: '2026-01-05', policyCount: '1', totalPremium: '2000' },
        ]),
      };
      mockInsurancePolicyRepository.createQueryBuilder.mockReturnValue(mockTrendQueryBuilder);

      // 调用服务方法
      const result = await service.getPremiumTrend(period, startDate, endDate);

      // 验证结果
      expect(result).toEqual([
        { period: '2026-01-01', policyCount: '1', totalPremium: '1000' },
        { period: '2026-01-05', policyCount: '1', totalPremium: '2000' },
      ]);
    });
  });

  describe('getCompanyDistribution', () => {
    it('should return company distribution correctly', async () => {
      // Mock数据
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-02-29');

      // 为保险政策查询构建器设置返回值
      const mockCompanyQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({}),
        getRawMany: jest.fn().mockResolvedValue([
          { companyName: '保险公司A', policyCount: '2', totalPremium: '3000' },
          { companyName: '保险公司B', policyCount: '1', totalPremium: '1500' },
        ]),
      };
      mockInsurancePolicyRepository.createQueryBuilder.mockReturnValue(mockCompanyQueryBuilder);

      // 调用服务方法
      const result = await service.getCompanyDistribution(startDate, endDate);

      // 验证结果
      expect(result).toEqual([
        { companyName: '保险公司A', policyCount: '2', totalPremium: '3000' },
        { companyName: '保险公司B', policyCount: '1', totalPremium: '1500' },
      ]);
    });
  });

  describe('getChannelDistribution', () => {
    it('should return channel distribution correctly', async () => {
      // Mock数据
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-02-29');

      // 为保险政策查询构建器设置返回值
      const mockChannelQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({}),
        getRawMany: jest.fn().mockResolvedValue([
          { channelName: '渠道A', policyCount: '2', totalPremium: '2500' },
          { channelName: '渠道B', policyCount: '1', totalPremium: '2000' },
        ]),
      };
      mockInsurancePolicyRepository.createQueryBuilder.mockReturnValue(mockChannelQueryBuilder);

      // 调用服务方法
      const result = await service.getChannelDistribution(startDate, endDate);

      // 验证结果
      expect(result).toEqual([
        { channelName: '渠道A', policyCount: '2', totalPremium: '2500' },
        { channelName: '渠道B', policyCount: '1', totalPremium: '2000' },
      ]);
    });
  });

  describe('getSettlementStatistics', () => {
    it('should return settlement statistics correctly', async () => {
      // Mock数据
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      mockSettlementRecordRepository.count.mockResolvedValue(2);

      // 为结算金额查询构建器设置返回值
      const mockSettlementAmountQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          totalCommission: '1300',
          totalTaxAmount: '78',
          totalNetAmount: '1222',
        }),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      // 为状态统计查询构建器设置返回值
      const mockStatusCountQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({}),
        getRawMany: jest.fn().mockResolvedValue([
          { status: '2', count: '1' },
          { status: '3', count: '1' },
        ]),
      };

      // 模拟createQueryBuilder多次调用返回不同的查询构建器
      mockSettlementRecordRepository.createQueryBuilder
        .mockReturnValueOnce(mockSettlementAmountQueryBuilder)
        .mockReturnValueOnce(mockStatusCountQueryBuilder);

      // 调用服务方法
      const result = await service.getSettlementStatistics(startDate, endDate);

      // 验证结果
      expect(result).toEqual({
        totalSettlements: 2,
        totalCommission: 1300,
        totalTaxAmount: 78,
        totalNetAmount: 1222,
        statusDistribution: [
          { status: 2, statusText: '已确认', count: 1 },
          { status: 3, statusText: '已支付', count: 1 },
        ],
      });
    });
  });

  describe('updateAllStatistics', () => {
    it('should clear old cache and update all statistics', async () => {
      // Mock数据
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      // 设置mockInsurancePolicyRepository.count的返回值
      mockInsurancePolicyRepository.count.mockImplementation(options => {
        if (options.where.effectiveDate && options.where.effectiveDate._type === 'between') {
          return Promise.resolve(2);
        } else if (
          options.where.effectiveDate &&
          options.where.effectiveDate._type === 'lessThanOrEqual' &&
          options.where.expiryDate &&
          options.where.expiryDate._type === 'moreThanOrEqual'
        ) {
          return Promise.resolve(3);
        }
        return Promise.resolve(0);
      });

      // 设置mockSettlementRecordRepository.count的返回值
      mockSettlementRecordRepository.count.mockResolvedValue(2);

      // 设置查询构建器的返回值
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          totalPremium: '3000',
          totalCommission: '1300',
          totalNetAmount: '1222',
          totalTaxAmount: '78',
        }),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      mockInsurancePolicyRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockSettlementRecordRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // 调用服务方法
      await service.updateAllStatistics(startDate, endDate);

      // 验证结果
      expect(mockAdvancedCacheService.clearCache).toHaveBeenCalled();
    });
  });

  describe('triggerStatisticsUpdate', () => {
    it('should emit message to RabbitMQ with provided dates', async () => {
      // Mock数据
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      // 调用服务方法
      await service.triggerStatisticsUpdate(startDate, endDate);

      // 验证结果
      expect(mockRabbitMQService.emit).toHaveBeenCalledWith('insurance.statistics.update', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
    });

    it('should emit message to RabbitMQ with default dates if not provided', async () => {
      // 调用服务方法
      await service.triggerStatisticsUpdate();

      // 验证结果
      expect(mockRabbitMQService.emit).toHaveBeenCalledWith(
        'insurance.statistics.update',
        expect.any(Object),
      );

      // 检查emit的参数
      const emitParams = mockRabbitMQService.emit.mock.calls[0][1];
      expect(emitParams.startDate).toBeDefined();
      expect(emitParams.endDate).toBeDefined();

      // 检查日期范围是否为最近30天
      const startDate = new Date(emitParams.startDate);
      const endDate = new Date(emitParams.endDate);
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      expect(diffDays).toBeLessThanOrEqual(30);
    });
  });
});
