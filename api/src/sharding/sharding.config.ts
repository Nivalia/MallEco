import { DataSource } from 'typeorm';

export const createShardingDataSource = (): DataSource => {
  return new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'malldb',

    // 其他配置
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  });
};

export class ShardingConfig {
  static getShardingRules() {
    return {
      // 订单相关分片规则
      order: {
        shardingKey: 'user_id',
        tableCount: 4,
        strategy: 'hash', // hash, range, time
      },

      // 支付相关分片规则
      payment: {
        shardingKey: 'user_id',
        tableCount: 4,
        strategy: 'hash',
      },

      // 商品相关分片规则
      product: {
        shardingKey: 'category_id',
        tableCount: 8,
        strategy: 'hash',
      },
    };
  }

  // 分片算法实现
  static getShardingAlgorithm() {
    return {
      // 基于用户ID的取模分片
      userHashSharding: (shardingValue: unknown, tableCount: number) => {
        let userId: number;
        if (typeof shardingValue === 'number') {
          userId = shardingValue;
        } else if (typeof shardingValue === 'string') {
          userId = parseInt(shardingValue);
        } else {
          // 如果是对象，尝试获取id属性
          const valueObj = shardingValue as any;
          userId = parseInt(String(valueObj?.id || valueObj?.userId || 0));
        }
        return Math.abs(userId) % tableCount;
      },

      // 基于时间范围的分片
      timeRangeSharding: (shardingValue: Date, tableCount: number) => {
        const month = shardingValue.getMonth() + 1;
        const year = shardingValue.getFullYear();
        return (year * 12 + month) % tableCount;
      },

      // 基于分类的分片
      categorySharding: (shardingValue: unknown, tableCount: number) => {
        let categoryId: number;
        if (typeof shardingValue === 'number') {
          categoryId = shardingValue;
        } else if (typeof shardingValue === 'string') {
          categoryId = parseInt(shardingValue);
        } else {
          // 如果是对象，尝试获取id属性
          const valueObj = shardingValue as any;
          categoryId = parseInt(String(valueObj?.id || valueObj?.categoryId || 0));
        }
        return Math.abs(categoryId) % tableCount;
      },
    };
  }
}
