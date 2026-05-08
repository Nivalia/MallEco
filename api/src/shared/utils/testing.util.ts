import { TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from '../interceptors/response.interceptor';
import { GlobalExceptionFilter } from '../filters/global-exception.filter';

/**
 * 测试应用构建选项
 */
export interface TestAppOptions {
  /**
   * 是否启用全局验证管道
   */
  enableValidation?: boolean;

  /**
   * 是否启用全局拦截器
   */
  enableInterceptors?: boolean;

  /**
   * 是否启用全局过滤器
   */
  enableFilters?: boolean;

  /**
   * 是否启用全局前缀
   */
  globalPrefix?: string;
}

/**
 * 测试模块构建选项
 */
export interface TestModuleOptions {
  /**
   * 提供者
   */
  providers?: any[];

  /**
   * 控制器
   */
  controllers?: any[];

  /**
   * 导入的模块
   */
  imports?: any[];
}

/**
 * 常用的测试辅助函数
 */
export const TestUtils = {
  /**
   * 创建测试模块
   */
  createTestingModule(options: TestModuleOptions): any {
    const { Test } = require('@nestjs/testing');
    const builder = Test.createTestingModule({
      imports: options.imports || [],
      providers: options.providers || [],
      controllers: options.controllers || [],
    });
    return builder;
  },

  /**
   * 配置测试应用
   */
  async configureTestApp(
    app: INestApplication,
    options: TestAppOptions = {},
  ): Promise<INestApplication> {
    const {
      enableValidation = true,
      enableInterceptors = true,
      enableFilters = true,
      globalPrefix = 'api',
    } = options;

    // 设置全局前缀
    app.setGlobalPrefix(globalPrefix);

    // 添加验证管道
    if (enableValidation) {
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          transform: true,
          forbidNonWhitelisted: true,
        }),
      );
    }

    // 添加响应拦截器
    if (enableInterceptors) {
      app.useGlobalInterceptors(new ResponseInterceptor());
    }

    // 添加异常过滤器
    if (enableFilters) {
      app.useGlobalFilters(new GlobalExceptionFilter());
    }

    return app;
  },

  /**
   * 生成测试数据
   */
  generateMockData<T>(template: Partial<T>, count: number = 1): T[] {
    if (count === 1) {
      return [template as T];
    }
    return Array.from(
      { length: count },
      (_, index) =>
        ({
          ...template,
          id: `${index + 1}`,
        }) as T,
    );
  },

  /**
   * 分页模拟数据
   */
  generatePaginatedMockData<T>(
    items: T[],
    page: number = 1,
    pageSize: number = 10,
  ): { data: T[]; total: number; page: number; pageSize: number } {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      data: items.slice(start, end),
      total: items.length,
      page,
      pageSize,
    };
  },
};

/**
 * 模拟请求对象
 */
export class MockRequest {
  user?: any;
  params?: any;
  query?: any;
  body?: any;
  headers?: any;

  constructor(options: Partial<MockRequest> = {}) {
    this.user = options.user;
    this.params = options.params;
    this.query = options.query;
    this.body = options.body;
    this.headers = options.headers;
  }
}

/**
 * 模拟响应对象
 */
export class MockResponse {
  statusCode: number = 200;
  data: any;
  message: string = 'success';

  status(code: number): this {
    this.statusCode = code;
    return this;
  }

  json(data: any): this {
    this.data = data;
    return this;
  }
}

/**
 * 模拟用户
 */
export const MockUser = {
  admin: {
    id: '1',
    username: 'admin',
    roles: ['admin'],
    permissions: ['*'],
    isAdmin: true,
  },

  user: {
    id: '2',
    username: 'testuser',
    roles: ['user'],
    permissions: ['user:read', 'user:update'],
    isAdmin: false,
  },

  guest: {
    id: '3',
    username: 'guest',
    roles: ['guest'],
    permissions: [],
    isAdmin: false,
  },
};

/**
 * 常用断言辅助函数
 */
export const TestAssertions = {
  /**
   * 断言分页响应
   */
  assertPaginatedResponse(response: any): void {
    expect(response).toHaveProperty('data');
    expect(response).toHaveProperty('total');
    expect(response).toHaveProperty('page');
    expect(response).toHaveProperty('pageSize');
  },

  /**
   * 断言标准响应
   */
  assertStandardResponse(response: any): void {
    expect(response).toHaveProperty('code');
    expect(response).toHaveProperty('message');
    expect(response).toHaveProperty('timestamp');
  },

  /**
   * 断言实体
   */
  assertEntity(entity: any, expectedFields: Record<string, any>): void {
    Object.entries(expectedFields).forEach(([key, value]) => {
      expect(entity).toHaveProperty(key);
      if (value !== undefined) {
        expect(entity[key]).toBe(value);
      }
    });
  },
};
