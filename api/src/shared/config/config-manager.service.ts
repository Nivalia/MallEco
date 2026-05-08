import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdvancedLoggerService } from '../../logging/advanced-logger.service';
import {
  DatabaseConfig,
  ServerConfig,
  CacheConfig,
  SecurityConfig,
  AppConfig,
} from '../../config/configuration';

@Injectable()
export class ConfigManagerService implements OnModuleInit {
  private configCache: Map<string, any> = new Map();
  private configWatchers: Map<string, Array<(newValue: any, oldValue: any) => void>> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AdvancedLoggerService,
  ) {}

  /**
   * 模块初始化时加载配置并验证
   */
  async onModuleInit() {
    await this.loadAllConfigs();
    const isValid = this.validateConfig();
    if (isValid) {
      this.logger.info('ConfigManager initialized successfully with valid configuration', {
        service: 'ConfigManager',
      });
    } else {
      this.logger.error('ConfigManager initialized with invalid configuration', {
        service: 'ConfigManager',
      });
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }

  /**
   * 加载所有配置到缓存
   */
  private async loadAllConfigs() {
    // 加载核心配置
    const coreConfigs = ['database', 'server', 'cache', 'security', 'websocket'];

    for (const configKey of coreConfigs) {
      const configValue = this.configService.get<any>(configKey);
      this.configCache.set(configKey, configValue);
    }

    this.logger.info('All configurations loaded into cache', { service: 'ConfigManager' });
  }

  /**
   * 获取数据库配置
   */
  getDatabaseConfig(): DatabaseConfig {
    return this.configCache.get('database') as DatabaseConfig;
  }

  /**
   * 获取服务器配置
   */
  getServerConfig(): ServerConfig {
    return this.configCache.get('server') as ServerConfig;
  }

  /**
   * 获取缓存配置
   */
  getCacheConfig(): CacheConfig {
    return this.configCache.get('cache') as CacheConfig;
  }

  /**
   * 获取安全配置
   */
  getSecurityConfig(): SecurityConfig {
    return this.configCache.get('security') as SecurityConfig;
  }

  /**
   * 获取WebSocket配置
   */
  getWebSocketConfig(): any {
    return this.configCache.get('websocket');
  }

  /**
   * 获取完整的应用配置
   */
  getAppConfig(): AppConfig {
    return {
      database: this.getDatabaseConfig(),
      server: this.getServerConfig(),
      cache: this.getCacheConfig(),
      security: this.getSecurityConfig(),
    };
  }

  /**
   * 根据键获取配置值
   * @param key 配置键
   * @param defaultValue 默认值
   */
  get<T = any>(key: string, defaultValue?: T): T {
    // 先检查完整键
    if (this.configCache.has(key)) {
      return this.configCache.get(key) as T;
    }

    // 检查嵌套键，如 'database.host'
    const [section, ...subkeys] = key.split('.');
    if (section && subkeys.length > 0 && this.configCache.has(section)) {
      let value = this.configCache.get(section);
      for (const subkey of subkeys) {
        if (value && typeof value === 'object' && subkey in value) {
          value = value[subkey];
        } else {
          return defaultValue;
        }
      }
      return value as T;
    }

    return defaultValue;
  }

  /**
   * 更新配置值（支持动态更新）
   * @param key 配置键
   * @param value 新值
   */
  async update(key: string, value: any): Promise<void> {
    const oldValue = this.get(key);

    // 更新完整键
    if (this.configCache.has(key)) {
      this.configCache.set(key, value);
    } else {
      // 更新嵌套键
      const [section, ...subkeys] = key.split('.');
      if (section && this.configCache.has(section)) {
        const sectionConfig = this.configCache.get(section);
        let current = sectionConfig;

        // 遍历到最后一个子键的父对象
        for (let i = 0; i < subkeys.length - 1; i++) {
          const subkey = subkeys[i];
          if (!current[subkey]) {
            current[subkey] = {};
          }
          current = current[subkey];
        }

        // 设置最后一个子键的值
        const lastSubkey = subkeys[subkeys.length - 1];
        current[lastSubkey] = value;

        // 更新整个section
        this.configCache.set(section, { ...sectionConfig });
      }
    }

    // 通知监听器
    this.notifyWatchers(key, value, oldValue);
    this.logger.info(`Configuration updated: ${key}`, {
      service: 'ConfigManager',
      oldValue,
      newValue: value,
    });
  }

  /**
   * 注册配置变更监听器
   * @param key 配置键
   * @param callback 回调函数
   */
  watch(key: string, callback: (newValue: any, oldValue: any) => void): void {
    if (!this.configWatchers.has(key)) {
      this.configWatchers.set(key, []);
    }
    this.configWatchers.get(key).push(callback);
    this.logger.info(`Watcher registered for config: ${key}`, { service: 'ConfigManager' });
  }

  /**
   * 移除配置变更监听器
   * @param key 配置键
   * @param callback 回调函数
   */
  unwatch(key: string, callback: (newValue: any, oldValue: any) => void): void {
    if (this.configWatchers.has(key)) {
      const callbacks = this.configWatchers.get(key).filter(cb => cb !== callback);
      if (callbacks.length > 0) {
        this.configWatchers.set(key, callbacks);
      } else {
        this.configWatchers.delete(key);
      }
      this.logger.info(`Watcher removed for config: ${key}`, { service: 'ConfigManager' });
    }
  }

  /**
   * 通知监听器配置变更
   * @param key 配置键
   * @param newValue 新值
   * @param oldValue 旧值
   */
  private notifyWatchers(key: string, newValue: any, oldValue: any): void {
    if (this.configWatchers.has(key)) {
      const callbacks = this.configWatchers.get(key);
      for (const callback of callbacks) {
        try {
          callback(newValue, oldValue);
        } catch (error) {
          this.logger.error(`Error in config watcher for ${key}`, {
            service: 'ConfigManager',
            error: error.message,
          });
        }
      }
    }
  }

  /**
   * 验证配置的完整性和有效性
   */
  validateConfig(): boolean {
    const appConfig = this.getAppConfig();
    let isValid = true;

    // 验证数据库配置
    if (!appConfig.database.host || !appConfig.database.username || !appConfig.database.database) {
      this.logger.error('Invalid database configuration: missing required fields', {
        service: 'ConfigManager',
      });
      isValid = false;
    }

    // 验证安全配置
    if (!appConfig.security.jwtSecret || appConfig.security.jwtSecret === 'your-secret-key') {
      this.logger.warn(
        'Using default JWT secret - please configure a secure secret in production',
        { service: 'ConfigManager' },
      );
    }

    // 验证缓存配置
    if (
      appConfig.cache.store === 'redis' &&
      (!appConfig.cache.redis?.host || !appConfig.cache.redis?.port)
    ) {
      this.logger.error('Invalid redis configuration: missing host or port', {
        service: 'ConfigManager',
      });
      isValid = false;
    }

    return isValid;
  }

  /**
   * 获取配置统计信息
   */
  getConfigStats(): any {
    return {
      totalConfigs: this.configCache.size,
      watchedKeys: this.configWatchers.size,
      configKeys: Array.from(this.configCache.keys()),
      watchedConfigKeys: Array.from(this.configWatchers.keys()),
    };
  }
}
