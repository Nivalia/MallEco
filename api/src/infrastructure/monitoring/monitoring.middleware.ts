import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrometheusService } from './prometheus.service';

interface RequestWithLocals extends Request {
  locals: {
    startTime?: number;
    [key: string]: any;
  };
}

interface ResponseWithSend extends Response {
  send: (body?: any) => this;
}

@Injectable()
export class MonitoringMiddleware implements NestMiddleware {
  private static prometheusServiceInstance: PrometheusService;

  constructor(private readonly prometheusService: PrometheusService) {
    MonitoringMiddleware.prometheusServiceInstance = prometheusService;
  }

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    // 记录请求开始时间
    const reqWithLocals = req as RequestWithLocals;
    reqWithLocals.locals.startTime = startTime;

    // 重写send方法以捕获响应时间
    const resWithSend = res as ResponseWithSend;
    const originalSend: (body?: any) => Response = res.send.bind(res);

    resWithSend.send = function (body?: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // 记录HTTP指标
      const route: string = req.route?.path || req.path;
      const method = req.method;
      const statusCode = res.statusCode;

      // 排除监控端点自身
      if (!route.includes('./infrastructure/monitoring')) {
        MonitoringMiddleware.prometheusServiceInstance.recordHttpRequest(
          method,
          route,
          statusCode,
          duration,
        );
      }

      return originalSend.call(this, body);
    };

    next();
  }
}
