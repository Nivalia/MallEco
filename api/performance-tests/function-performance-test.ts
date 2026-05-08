// 函数性能测试脚本（使用TypeScript编写，需用ts-node运行）
import { Suite } from 'benchmark';
import { InsuranceStatisticsService } from '../src/modules/insurance/services/insurance-statistics.service';
import { AdvancedCacheService } from '@infrastructure/cache/advanced-cache.service';
import { ConfigService } from '@nestjs/config';

// 创建一个简单的模拟函数，替代jest.fn()
const createMockFn = (implementation?: Function) => {
  const mockFn: any = implementation || (() => {});
  mockFn.mockResolvedValue = (value: any) => {
    mockFn._resolvedValue = value;
    return mockFn;
  };
  mockFn.mockReturnThis = () => {
    return mockFn;
  };
  return mockFn;
};

// 使用模拟的createMockFn替代jest.fn
const mockRepository = {
  count: createMockFn().mockResolvedValue(100),
  createQueryBuilder: createMockFn(() => ({
    select: createMockFn().mockReturnThis(),
    addSelect: createMockFn().mockReturnThis(),
    where: createMockFn().mockReturnThis(),
    innerJoin: createMockFn().mockReturnThis(),
    groupBy: createMockFn().mockReturnThis(),
    orderBy: createMockFn().mockReturnThis(),
    getRawOne: createMockFn().mockResolvedValue({ totalPremium: '10000', totalCommission: '1500' }),
    getRawMany: createMockFn().mockResolvedValue([]),
  })),
};

// 模拟缓存服务
class MockCacheService {
  private cache: Map<string, any>;
  private hitCount: number;
  private missCount: number;

  constructor() {
    this.cache = new Map();
    this.hitCount = 0;
    this.missCount = 0;
  }

  async readThrough(key: string, fn: () => Promise<any>, ttl = 3600): Promise<any> {
    // 检查缓存
    if (this.cache.has(key)) {
      this.hitCount++;
      return this.cache.get(key);
    }

    // 缓存未命中，调用函数
    this.missCount++;
    const result = await fn();
    
    // 写入缓存
    this.cache.set(key, result);
    
    return result;
  }

  async clearCache(pattern: string): Promise<void> {
    // 清除所有缓存
    this.cache.clear();
  }

  // 添加getter方法来访问私有属性
  getCacheHitCount(): number {
    return this.hitCount;
  }

  getCacheMissCount(): number {
    return this.missCount;
  }
}

// 模拟配置服务
class MockConfigService {
  get(key: string): any {
    return null;
  }
}

// 模拟RabbitMQ服务
class MockRabbitMQService {
  emit(event: string, data: any): Promise<void> {
    return Promise.resolve();
  }
}

// 模拟ChartRenderService
class MockChartRenderService {
  renderChart = async () => {
    return {
      png: Buffer.from('mock chart data'),
      base64: 'data:image/png;base64,mockBase64Data',
      svg: {},
    };
  };
}

// 创建服务实例
const cacheService = new MockCacheService();
const configService = new MockConfigService();
const rabbitMQService = new MockRabbitMQService();
const chartRenderService = new MockChartRenderService();

const statisticsService = new InsuranceStatisticsService(
  mockRepository as any, // insurancePolicyRepository
  mockRepository as any, // settlementRecordRepository
  mockRepository as any, // insuranceCompanyRepository
  mockRepository as any, // channelRepository
  mockRepository as any, // claimRecordRepository
  mockRepository as any, // renewalRecordRepository
  cacheService as any, // advancedCacheService
  configService as any, // configService
  rabbitMQService as any, // rabbitMQService
  chartRenderService as any // chartRenderService
);

// 性能测试套件
const suite = new Suite();

// 测试缓存性能
const startDate = new Date('2026-01-01');
const endDate = new Date('2026-01-31');

// 添加测试用例
suite
  .add('缓存读取（第一次，未命中）', {
    defer: true,
    fn: function(deferred) {
      statisticsService.getBusinessStatistics(startDate, endDate)
        .then(() => deferred.resolve());
    }
  })
  .add('缓存读取（第二次，命中）', {
    defer: true,
    fn: function(deferred) {
      statisticsService.getBusinessStatistics(startDate, endDate)
        .then(() => deferred.resolve());
    }
  })
  .add('缓存清除和重建', {
    defer: true,
    fn: async function(deferred) {
      await cacheService.clearCache('*');
      await statisticsService.getBusinessStatistics(startDate, endDate);
      deferred.resolve();
    }
  })
  .add('统计分析计算', {
    defer: true,
    fn: function(deferred) {
      statisticsService.updateAllStatistics(startDate, endDate)
        .then(() => deferred.resolve());
    }
  })
  
  // 监听事件
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('\n最快的是: ' + this.filter('fastest').map('name'));
    console.log('\n缓存命中率: ' + cacheService.getCacheHitCount());
    console.log('缓存未命中率: ' + cacheService.getCacheMissCount());
    console.log('缓存总请求数: ' + (cacheService.getCacheHitCount() + cacheService.getCacheMissCount()));
  })
  
  // 运行测试
  .run({ async: true });
