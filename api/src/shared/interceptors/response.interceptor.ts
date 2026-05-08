import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  path: string;
  code: number;
}

export interface PaginatedResponse<T> {
  list: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map(data => {
        if (data && typeof data.pipe === 'function') {
          return data;
        }

        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        const statusCode = response.statusCode || HttpStatus.OK;
        const success = statusCode >= 200 && statusCode < 300;

        const formattedData = this.formatResponse(data);

        return {
          success,
          data: formattedData,
          message: success ? 'success' : 'error',
          timestamp: new Date().toISOString(),
          path: request.url,
          code: statusCode,
        };
      }),
    );
  }

  private formatResponse(data: any): any {
    if (!data) return null;

    if (this.isPaginatedResponse(data)) {
      return data;
    }

    if (Array.isArray(data)) {
      return data;
    }

    return data;
  }

  private isPaginatedResponse(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      'list' in data &&
      'pagination' in data &&
      Array.isArray(data.list) &&
      typeof data.pagination === 'object'
    );
  }
}

@Injectable()
export class PaginatedResponseInterceptor<T> implements NestInterceptor<T, PaginatedResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<PaginatedResponse<T>> {
    return next.handle().pipe(
      map(data => {
        if (this.isPaginatedResponse(data)) {
          return data;
        }

        return {
          list: [],
          pagination: {
            page: 1,
            pageSize: 10,
            total: 0,
            totalPages: 0,
          },
        };
      }),
    );
  }

  private isPaginatedResponse(data: any): boolean {
    return data && typeof data === 'object' && 'list' in data && 'pagination' in data;
  }
}
