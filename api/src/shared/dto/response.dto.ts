import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ description: '状态码', example: 200 })
  code: number;

  @ApiProperty({ description: '消息', example: 'success' })
  message: string;

  @ApiPropertyOptional({ description: '数据' })
  data?: T;

  @ApiProperty({ description: '时间戳', example: '2026-02-27T10:00:00.000Z' })
  timestamp: string;

  static success<T>(data?: T, message = 'success'): ApiResponseDto<T> {
    return {
      code: 200,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(code: number, message: string): ApiResponseDto {
    return {
      code,
      message,
      timestamp: new Date().toISOString(),
    };
  }
}

export class PaginatedResponseDto<T = any> {
  @ApiProperty({ description: '数据列表' })
  list: T[];

  @ApiProperty({ description: '分页信息' })
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };

  static create<T>(
    list: T[],
    total: number,
    page: number,
    pageSize: number,
  ): PaginatedResponseDto<T> {
    return {
      list,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}

export type PaginatedResponse<T = any> = PaginatedResponseDto<T>;

export class ApiErrorDto {
  @ApiProperty({ description: '错误码', example: 400 })
  code: number;

  @ApiProperty({ description: '错误消息', example: '参数错误' })
  message: string;

  @ApiPropertyOptional({ description: '错误详情' })
  errors?: Array<{ field: string; message: string }>;

  static create(
    code: number,
    message: string,
    errors?: Array<{ field: string; message: string }>,
  ): ApiErrorDto {
    return {
      code,
      message,
      errors,
    };
  }
}
