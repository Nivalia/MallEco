import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface LogParams {
  module?: string;
  class?: string;
  method?: string;
  logRequest?: boolean;
  logResponse?: boolean;
  logParams?: boolean;
  logBody?: boolean;
  excludeBody?: string[];
}

export const Log = createParamDecorator((options: LogParams, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return {
    ...options,
    method: request.method,
    path: request.url,
    ip: request.ip,
    userAgent: request.headers['user-agent'],
    requestId: request.headers['x-request-id'] || request.id,
  };
});
