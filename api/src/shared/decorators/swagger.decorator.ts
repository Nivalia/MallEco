import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
  ApiTags,
  ApiConsumes,
  ApiProduces,
} from '@nestjs/swagger';

/**
 * 通用API响应装饰器
 */
export function ApiCommonResponse() {
  return applyDecorators(
    ApiResponse({ status: 200, description: '请求成功' }),
    ApiResponse({ status: 400, description: '请求参数错误' }),
    ApiResponse({ status: 401, description: '未授权，请先登录' }),
    ApiResponse({ status: 403, description: '权限不足' }),
    ApiResponse({ status: 404, description: '资源不存在' }),
    ApiResponse({ status: 500, description: '服务器内部错误' }),
  );
}

/**
 * 分页查询装饰器
 */
export function ApiPaginationQuery() {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: '页码，从1开始',
      example: 1,
    }),
    ApiQuery({
      name: 'size',
      required: false,
      type: Number,
      description: '每页数量',
      example: 20,
    }),
    ApiQuery({
      name: 'sort',
      required: false,
      type: String,
      description: '排序字段，格式：field,asc|desc',
      example: 'createTime,desc',
    }),
  );
}

/**
 * ID参数装饰器
 */
export function ApiIdParam(description: string = 'ID') {
  return ApiParam({
    name: 'id',
    type: String,
    description,
    example: '123',
  });
}

/**
 * 认证装饰器
 */
export function ApiAuth() {
  return ApiBearerAuth('JWT-auth');
}

/**
 * 文件上传装饰器
 */
export function ApiFileUpload(fieldName: string = 'file', description: string = '上传的文件') {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fieldName]: {
            type: 'string',
            format: 'binary',
            description,
          },
        },
      },
    }),
  );
}

/**
 * 创建操作装饰器
 */
export function ApiCreateOperation(summary: string, description?: string) {
  return applyDecorators(
    ApiOperation({ summary, description }),
    ApiResponse({ status: 201, description: '创建成功' }),
    ApiResponse({ status: 400, description: '创建失败，参数错误' }),
    ApiResponse({ status: 409, description: '资源已存在' }),
  );
}

/**
 * 更新操作装饰器
 */
export function ApiUpdateOperation(summary: string, description?: string) {
  return applyDecorators(
    ApiOperation({ summary, description }),
    ApiResponse({ status: 200, description: '更新成功' }),
    ApiResponse({ status: 400, description: '更新失败，参数错误' }),
    ApiResponse({ status: 404, description: '资源不存在' }),
  );
}

/**
 * 删除操作装饰器
 */
export function ApiDeleteOperation(summary: string, description?: string) {
  return applyDecorators(
    ApiOperation({ summary, description }),
    ApiResponse({ status: 200, description: '删除成功' }),
    ApiResponse({ status: 404, description: '资源不存在' }),
  );
}

/**
 * 查询操作装饰器
 */
export function ApiGetOperation(summary: string, description?: string) {
  return applyDecorators(
    ApiOperation({ summary, description }),
    ApiResponse({ status: 200, description: '查询成功' }),
    ApiResponse({ status: 404, description: '资源不存在' }),
  );
}

/**
 * 列表查询操作装饰器
 */
export function ApiListOperation(summary: string, description?: string) {
  return applyDecorators(
    ApiOperation({ summary, description }),
    ApiPaginationQuery(),
    ApiResponse({ status: 200, description: '查询成功' }),
  );
}

/**
 * API 文档配置
 */
export const ApiDocsConfig = {
  title: 'MallEco API',
  description: '电商生态系统 RESTful API',
  version: '1.0.0',
  tags: [
    { name: 'Auth', description: '认证授权' },
    { name: 'Users', description: '用户管理' },
    { name: 'Goods', description: '商品管理' },
    { name: 'Orders', description: '订单管理' },
    { name: 'Payment', description: '支付管理' },
    { name: 'Cart', description: '购物车' },
    { name: 'Distribution', description: '分销管理' },
    { name: 'Admin', description: '后台管理' },
  ],
};

/**
 * 标准响应示例
 */
export const ResponseExamples = {
  success: {
    code: 200,
    message: 'success',
    data: {},
    timestamp: '2024-01-01T00:00:00.000Z',
  },

  paginated: {
    code: 200,
    message: 'success',
    data: {
      items: [],
      pageInfo: {
        page: 1,
        pageSize: 10,
        total: 100,
        totalPages: 10,
        hasNext: true,
        hasPrev: false,
      },
    },
    timestamp: '2024-01-01T00:00:00.000Z',
  },

  created: {
    code: 201,
    message: '创建成功',
    data: { id: '1' },
    timestamp: '2024-01-01T00:00:00.000Z',
  },

  badRequest: {
    code: 400,
    message: '请求参数错误',
    errors: [],
    timestamp: '2024-01-01T00:00:00.000Z',
  },

  unauthorized: {
    code: 401,
    message: '未授权，请先登录',
    timestamp: '2024-01-01T00:00:00.000Z',
  },

  forbidden: {
    code: 403,
    message: '没有权限访问该资源',
    timestamp: '2024-01-01T00:00:00.000Z',
  },

  notFound: {
    code: 404,
    message: '资源不存在',
    timestamp: '2024-01-01T00:00:00.000Z',
  },

  internalError: {
    code: 500,
    message: '服务器内部错误',
    timestamp: '2024-01-01T00:00:00.000Z',
  },
};
