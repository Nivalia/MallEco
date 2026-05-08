import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AdvancedCacheService } from './cache/advanced-cache.service';
import { CacheProtectionService } from './cache/cache-protection.service';
import { CacheWarmupService } from './cache/cache-warmup.service';
import { CacheMonitorService } from '../shared/monitoring/cache-monitor.service';
import { DatabaseQueryOptimizerService } from '../shared/monitoring/database-query-optimizer.service';
import { QueryPerformanceService } from '../shared/monitoring/query-performance.service';
import { ChartRenderService } from './services/chart-render.service';

/**
 * 基础设施模块
 * 提供缓存、监控等基础设施服务
 */
@Global()
@Module({
  imports: [
    CacheModule.register({
      ttl: 300, // 默认5分钟
      max: 100, // 最大缓存项数
    }),
  ],
  providers: [
    AdvancedCacheService,
    CacheProtectionService,
    CacheWarmupService,
    CacheMonitorService,
    DatabaseQueryOptimizerService,
    QueryPerformanceService,
    ChartRenderService,
  ],
  exports: [
    AdvancedCacheService,
    CacheProtectionService,
    CacheWarmupService,
    CacheMonitorService,
    DatabaseQueryOptimizerService,
    QueryPerformanceService,
    ChartRenderService,
  ],
})
export class InfrastructureModule {}
