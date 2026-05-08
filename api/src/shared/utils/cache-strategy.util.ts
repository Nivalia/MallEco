/**
 * 缓存策略配置
 *
 * 提供不同场景下的缓存策略
 */
export interface CacheStrategy {
  /**
   * 缓存键前缀
   */
  prefix: string;

  /**
   * 缓存过期时间(秒)
   */
  ttl: number;

  /**
   * 是否启用
   */
  enabled: boolean;

  /**
   * 缓存条件
   */
  condition?: (result: any) => boolean;
}

/**
 * 预定义的缓存策略
 */
export const CacheStrategies = {
  /**
   * 用户信息 - 30分钟
   */
  user: {
    prefix: 'user',
    ttl: 1800,
    enabled: true,
  } as CacheStrategy,

  /**
   * 商品列表 - 5分钟
   */
  goodsList: {
    prefix: 'goods:list',
    ttl: 300,
    enabled: true,
  } as CacheStrategy,

  /**
   * 商品详情 - 10分钟
   */
  goodsDetail: {
    prefix: 'goods:detail',
    ttl: 600,
    enabled: true,
  } as CacheStrategy,

  /**
   * 分类列表 - 1小时
   */
  category: {
    prefix: 'category',
    ttl: 3600,
    enabled: true,
  } as CacheStrategy,

  /**
   * 配置信息 - 24小时
   */
  config: {
    prefix: 'config',
    ttl: 86400,
    enabled: true,
  } as CacheStrategy,

  /**
   * 字典数据 - 12小时
   */
  dict: {
    prefix: 'dict',
    ttl: 43200,
    enabled: true,
  } as CacheStrategy,

  /**
   * 权限信息 - 30分钟
   */
  permission: {
    prefix: 'permission',
    ttl: 1800,
    enabled: true,
  } as CacheStrategy,

  /**
   * 角色信息 - 1小时
   */
  role: {
    prefix: 'role',
    ttl: 3600,
    enabled: true,
  } as CacheStrategy,

  /**
   * 统计信息 - 5分钟
   */
  statistics: {
    prefix: 'statistics',
    ttl: 300,
    enabled: true,
  } as CacheStrategy,

  /**
   * 热门搜索 - 10分钟
   */
  hotSearch: {
    prefix: 'hot:search',
    ttl: 600,
    enabled: true,
  } as CacheStrategy,

  /**
   * 推荐商品 - 15分钟
   */
  recommendation: {
    prefix: 'recommendation',
    ttl: 900,
    enabled: true,
  } as CacheStrategy,
};

/**
 * 生成缓存键
 */
export function generateCacheKey(prefix: string, ...args: string[]): string {
  return `${prefix}:${args.join(':')}`;
}

/**
 * 生成列表缓存键
 */
export function generateListCacheKey(
  prefix: string,
  page: number,
  pageSize: number,
  params?: Record<string, any>,
): string {
  const base = `${prefix}:list:${page}:${pageSize}`;
  if (params && Object.keys(params).length > 0) {
    const paramsStr = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${key}:${value}`)
      .join(':');
    return paramsStr ? `${base}:${paramsStr}` : base;
  }
  return base;
}

/**
 * 缓存条件判断
 */
export function shouldCache(result: any, condition?: (result: any) => boolean): boolean {
  if (!result) return false;
  if (condition) return condition(result);
  return true;
}

/**
 * 清除缓存模式
 */
export function clearCachePattern(pattern: string): string {
  return `${pattern}*`;
}
