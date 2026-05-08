import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettlementRecordService } from './settlement-record.service';
import { SettlementRecord } from '../entities/settlement-record.entity';
import { SettlementDetail } from '../entities/settlement-detail.entity';
import { InsurancePolicy } from '../entities/insurance-policy.entity';
import { CreateSettlementRecordDto } from '../dto/create-settlement-record.dto';
import { UpdateSettlementRecordDto } from '../dto/update-settlement-record.dto';
import { PaginationDto } from '../../../shared/dto/common.dto';
import { RabbitMQService } from '@infrastructure/rabbitmq/rabbitmq.service';

class SettlementRecordRepositoryMock {
  find = jest.fn<void, any[]>(function (this: void) {});
  findOne = jest.fn<void, any[]>(function (this: void) {});
  create = jest.fn<void, any[]>(function (this: void) {});
  save = jest.fn<void, any[]>(function (this: void) {});
  update = jest.fn<void, any[]>(function (this: void) {});
  delete = jest.fn<void, any[]>(function (this: void) {});
  createQueryBuilder = jest.fn<void, any[]>(function (this: void) {});
}

class SettlementDetailRepositoryMock {
  find = jest.fn<void, any[]>(function (this: void) {});
  create = jest.fn<void, any[]>(function (this: void) {});
  save = jest.fn<void, any[]>(function (this: void) {});
  delete = jest.fn<void, any[]>(function (this: void) {});
}

class InsurancePolicyRepositoryMock {
  find = jest.fn<void, any[]>(function (this: void) {});
  findOne = jest.fn<void, any[]>(function (this: void) {});
  createQueryBuilder = jest.fn<void, any[]>(function (this: void) {});
  save = jest.fn<void, any[]>(function (this: void) {});
}

class RabbitMQServiceMock {
  emit = jest.fn<void, [string, any]>(function (this: void) {}).mockName('emit');
}

describe('SettlementRecordService', () => {
  let service: SettlementRecordService;
  let settlementRecordRepository: Repository<SettlementRecord>;
  let settlementDetailRepository: Repository<SettlementDetail>;
  let insurancePolicyRepository: Repository<InsurancePolicy>;
  let rabbitMQService: RabbitMQService;

  const mockSettlementRecord: SettlementRecord = {
    id: '1',
    settlementNumber: 'SETTLE001',
    settlementType: 1,
    channelId: 1,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-01-31'),
    settlementPeriod: '202601',
    totalPolicies: 10,
    totalPremium: 10000,
    totalCommission: 1500,
    taxAmount: 90,
    netAmount: 1410,
    settlementMethod: 'bank_transfer',
    bankAccount: '6222021234567890123',
    bankName: '中国工商银行',
    status: 1,
    remarks: '测试结算单',
    confirmedBy: null,
    confirmedAt: null,
    paidBy: null,
    paidAt: null,
    settlementDate: null,
    channel: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as unknown as SettlementRecord;

  const mockSettlementDetail: SettlementDetail = {
    id: '1',
    settlementId: '1',
    policyId: '1',
    premium: 1000,
    commissionRate: 0.15,
    commissionAmount: 150,
    taxIncluded: 1,
    taxAmount: 9,
    netAmount: 141,
    policy: null,
    settlement: null,
  } as unknown as SettlementDetail;

  const mockInsurancePolicy: InsurancePolicy = {
    id: '1',
    policyNumber: 'POL001',
    policyHolderId: '1',
    insuranceCompanyId: '1',
    insuranceProductId: '1',
    insuranceType: 'CAR',
    channelId: '1',
    upstreamChannelId: '2',
    effectiveDate: new Date('2026-01-10'),
    expiryDate: new Date('2027-01-10'),
    premium: 1000,
    taxIncluded: 1,
    policyStatus: 1,
    downstreamPolicyRate: 0.15,
    downstreamCommission: 150,
    downstreamNetFee: 141,
    downstreamSettled: 0,
    downstreamSettlementDate: null,
    downstreamSettlementMethod: 'bank_transfer',
    upstreamPolicyRate: 0.1,
    upstreamCommission: 100,
    upstreamSettled: 0,
    upstreamSettlementDate: null,
    upstreamSettlementMethod: 'bank_transfer',
    taxAmount: 9,
    policyYear: 2026,
    businessMonth: 1,
    issueDate: new Date('2026-01-05'),
    remarks: '测试保单',
    auditStatus: 1,
    auditBy: null,
    auditAt: null,
    auditRemark: '',
    policyHolder: null,
    insuranceCompany: null,
    insuranceProduct: null,
    channel: null,
    upstreamChannel: null,
    isDel: 0,
    createTime: new Date(),
    updateTime: new Date(),
  } as unknown as InsurancePolicy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettlementRecordService,
        {
          provide: getRepositoryToken(SettlementRecord),
          useClass: SettlementRecordRepositoryMock,
        },
        {
          provide: getRepositoryToken(SettlementDetail),
          useClass: SettlementDetailRepositoryMock,
        },
        {
          provide: getRepositoryToken(InsurancePolicy),
          useClass: InsurancePolicyRepositoryMock,
        },
        {
          provide: RabbitMQService,
          useClass: RabbitMQServiceMock,
        },
      ],
    }).compile();

    service = module.get<SettlementRecordService>(SettlementRecordService);
    settlementRecordRepository = module.get<Repository<SettlementRecord>>(
      getRepositoryToken(SettlementRecord),
    );
    settlementDetailRepository = module.get<Repository<SettlementDetail>>(
      getRepositoryToken(SettlementDetail),
    );
    insurancePolicyRepository = module.get<Repository<InsurancePolicy>>(
      getRepositoryToken(InsurancePolicy),
    );
    rabbitMQService = module.get<RabbitMQService>(RabbitMQService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new settlement record and emit event to generate details', async () => {
      const createDto: CreateSettlementRecordDto = {
        settlementNumber: 'SETTLE001',
        settlementType: 1,
        channelId: 1,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-31'),
        settlementPeriod: '202601',
      };

      jest.spyOn(settlementRecordRepository, 'create').mockReturnValue(mockSettlementRecord as any);
      jest.spyOn(settlementRecordRepository, 'save').mockResolvedValue(mockSettlementRecord);
      jest.spyOn(rabbitMQService, 'emit').mockResolvedValue(undefined);
      const result = await service.create(createDto);

      expect(result).toEqual(mockSettlementRecord);

      expect(rabbitMQService.emit).toHaveBeenCalledWith('insurance.settlement.generate_details', {
        settlementId: mockSettlementRecord.id,
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated settlement records', async () => {
      const mockSettlementRecords = [mockSettlementRecord];

      jest.spyOn(settlementRecordRepository, 'createQueryBuilder').mockImplementation(function () {
        const mockQueryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getManyAndCount: jest
            .fn()
            .mockResolvedValue([mockSettlementRecords, mockSettlementRecords.length]),
        };
        return mockQueryBuilder as any;
      });

      const paginationDto = new PaginationDto();
      paginationDto.page = 1;
      paginationDto.pageSize = 10;
      const result = await service.findAll(paginationDto);
      expect(result).toEqual({ data: mockSettlementRecords, total: mockSettlementRecords.length });
    });
  });

  describe('findOne', () => {
    it('should return a settlement record by ID', async () => {
      jest.spyOn(settlementRecordRepository, 'findOne').mockResolvedValue(mockSettlementRecord);

      const result = await service.findOne('1');
      expect(result).toEqual(mockSettlementRecord);
    });
  });

  describe('generateSettlementDetails', () => {
    it('should generate settlement details for a settlement record', async () => {
      // Mock the policy query
      jest.spyOn(insurancePolicyRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue([mockInsurancePolicy]),
        };
        return mockQueryBuilder as any;
      });

      // Mock settlement detail creation and saving
      jest.spyOn(settlementDetailRepository, 'create').mockReturnValue(mockSettlementDetail as any);
      jest.spyOn(settlementDetailRepository, 'save').mockResolvedValue(mockSettlementDetail);

      // Mock policy update
      jest.spyOn(insurancePolicyRepository, 'save').mockResolvedValue(mockInsurancePolicy as any);

      // Mock settlement record update
      jest.spyOn(settlementRecordRepository, 'save').mockResolvedValue(mockSettlementRecord);

      await service.generateSettlementDetails(mockSettlementRecord);

      // Verify that settlement details were created and saved

      expect(settlementDetailRepository.create).toHaveBeenCalled();

      expect(settlementDetailRepository.save).toHaveBeenCalled();

      // Verify that policies were updated

      expect(insurancePolicyRepository.save).toHaveBeenCalled();

      // Verify that settlement record was updated

      expect(settlementRecordRepository.save).toHaveBeenCalled();
    });
  });
});
