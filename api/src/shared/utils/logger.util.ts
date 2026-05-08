import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogContext {
  module?: string;
  class?: string;
  method?: string;
  requestId?: string;
  userId?: string;
  ip?: string;
  [key: string]: any;
}

export interface LogOptions {
  level?: LogLevel;
  context?: LogContext;
  trace?: boolean;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private context: string;

  constructor(private configService?: ConfigService) {}

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, context?: LogContext | string) {
    this.write(LogLevel.INFO, message, context);
  }

  error(message: string, trace?: string, context?: LogContext | string) {
    this.write(LogLevel.ERROR, message, context, trace);
  }

  warn(message: string, context?: LogContext | string) {
    this.write(LogLevel.WARN, message, context);
  }

  debug(message: string, context?: LogContext | string) {
    this.write(LogLevel.DEBUG, message, context);
  }

  verbose(message: string, context?: LogContext | string) {
    this.write(LogLevel.DEBUG, message, context);
  }

  private write(level: LogLevel, message: string, context?: LogContext | string, trace?: string) {
    const ctx = typeof context === 'string' ? { module: context } : context;
    const logData = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: ctx?.module || this.context,
      ...ctx,
      trace,
    };

    const isProduction = this.configService?.get('NODE_ENV') === 'production';
    if (!isProduction || level !== LogLevel.DEBUG) {
      this.output(level, logData);
    }
  }

  private output(level: LogLevel, data: any) {
    const prefix = data.context ? `[${data.context}] ` : '';
    const levelPrefix = `[${level.toUpperCase()}]`;

    switch (level) {
      case LogLevel.ERROR:
        console.error(levelPrefix, prefix, data.message, data.trace || '');
        break;
      case LogLevel.WARN:
        console.warn(levelPrefix, prefix, data.message);
        break;
      default:
        console.log(levelPrefix, prefix, data.message);
    }
  }
}

export function createLogger(context: string): LoggerService {
  const logger = new LoggerService();
  logger.setContext(context);
  return logger;
}
