import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode, getErrorMessage, getErrorCodeModule } from '../exceptions/error-code';

interface ErrorResponse {
  success: boolean;
  code: number;
  message: string;
  module?: string;
  errors?: Array<{ field: string; message: string }>;
  timestamp: string;
  path: string;
  requestId?: string;
  trace?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = (request.headers['x-request-id'] as string) || crypto.randomUUID();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = ErrorCode.GLO_INTERNAL_ERROR;
    let message = getErrorMessage(code);
    let errors: ErrorResponse['errors'] = undefined;
    let trace: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        code = responseObj.code || this.mapStatusToCode(status);
        errors = responseObj.errors;
      }
    } else if (exception instanceof Error) {
      message = exception.message;

      // 数据库错误处理
      if (exception.message.includes('ER_DUP_ENTRY')) {
        status = HttpStatus.CONFLICT;
        code = ErrorCode.GLO_CONFLICT;
        message = '数据已存在';
      } else if (exception.message.includes('ER_NO_REFERENCED_ROW')) {
        status = HttpStatus.BAD_REQUEST;
        code = ErrorCode.GLO_BAD_REQUEST;
        message = '关联数据不存在';
      } else if (exception.message.includes('ER_ROW_IS_REFERENCED')) {
        status = HttpStatus.CONFLICT;
        code = ErrorCode.GLO_CONFLICT;
        message = '数据被引用，无法删除';
      }

      // 记录未预期错误
      this.logger.error(`[${requestId}] ${request.method} ${request.url}`, exception.stack);
    }

    const errorResponse: ErrorResponse = {
      success: false,
      code,
      message,
      module: getErrorCodeModule(code),
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
    };

    if (errors) {
      errorResponse.errors = errors;
    }

    // 开发环境添加堆栈信息
    if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
      errorResponse.trace = exception.stack;
    }

    response.status(status).json(errorResponse);
  }

  private mapStatusToCode(status: number): number {
    const statusCodeMap: Record<number, ErrorCode> = {
      [HttpStatus.BAD_REQUEST]: ErrorCode.GLO_BAD_REQUEST,
      [HttpStatus.UNAUTHORIZED]: ErrorCode.GLO_UNAUTHORIZED,
      [HttpStatus.FORBIDDEN]: ErrorCode.GLO_FORBIDDEN,
      [HttpStatus.NOT_FOUND]: ErrorCode.GLO_NOT_FOUND,
      [HttpStatus.CONFLICT]: ErrorCode.GLO_CONFLICT,
      [HttpStatus.UNPROCESSABLE_ENTITY]: ErrorCode.GLO_VALIDATION_FAILED,
      [HttpStatus.TOO_MANY_REQUESTS]: ErrorCode.GLO_TOO_MANY_REQUESTS,
      [HttpStatus.INTERNAL_SERVER_ERROR]: ErrorCode.GLO_INTERNAL_ERROR,
      [HttpStatus.SERVICE_UNAVAILABLE]: ErrorCode.GLO_SERVICE_UNAVAILABLE,
    };

    return statusCodeMap[status] || ErrorCode.GLO_INTERNAL_ERROR;
  }
}
