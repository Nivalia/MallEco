import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InsuranceStatisticsService } from './insurance-statistics.service';
import { InsurancePolicy } from '../entities/insurance-policy.entity';
import { SettlementRecord } from '../entities/settlement-record.entity';
import { InsuranceCompany } from '../entities/insurance-company.entity';
import { Channel } from '../entities/channel.entity';

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
        if (options.where.effectiveDate.Between) {
          return Promise.resolve(2); // 符合日期范围的保单数
        } else if (
          options.where.effectiveDate.LessThanOrEqual &&
          options.where.expiryDate.MoreThanOrEqual
        ) {
          return Promise.resolve(3); // 有效保单数
        }
        return Promise.resolve(0);
      });

      mockInsurancePolicyRepository.createQueryBuilder().getRawOne.mockResolvedValue({
        totalPremium: '3000',
      });

      mockSettlementRecordRepository.createQueryBuilder().getRawOne.mockResolvedValue({
        totalCommission: '1300',
        totalNetAmount: '1222',
      });

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

      mockInsurancePolicyRepository.createQueryBuilder().getRawMany.mockResolvedValue([
        { period: '2026-01-01', policyCount: '1', totalPremium: '1000' },
        { period: '2026-01-05', policyCount: '1', totalPremium: '2000' },
      ]);

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

      mockInsurancePolicyRepository.createQueryBuilder().getRawMany.mockResolvedValue([
        { companyName: '保险公司A', policyCount: '2', totalPremium: '3000' },
        { companyName: '保险公司B', policyCount: '1', totalPremium: '1500' },
      ]);

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

      mockInsurancePolicyRepository.createQueryBuilder().getRawMany.mockResolvedValue([
        { channelName: '渠道A', policyCount: '2', totalPremium: '2500' },
        { channelName: '渠道B', policyCount: '1', totalPremium: '2000' },
      ]);

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

      mockSettlementRecordRepository.createQueryBuilder().getRawOne.mockResolvedValue({
        totalCommission: '1300',
        totalTaxAmount: '78',
        totalNetAmount: '1222',
      });

      mockSettlementRecordRepository.createQueryBuilder().getRawMany.mockResolvedValue([
        { status: '2', count: '1' },
        { status: '3', count: '1' },
      ]);

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
});
