import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from './pipes/validation.pipe';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { RolesGuard, PermissionsGuard, AdminGuard } from './guards';

/**
 * Shared Module - 全局共享模块
 *
 * 提供所有模块都需要的基础设施:
 * - 验证管道
 * - 响应拦截器
 * - 全局异常过滤器
 * - 权限守卫
 *
 * 使用方法:
 * import { SharedModule } from '@shared/shared.module';
 *
 * @Module({
 *   imports: [SharedModule],
 * })
 */
@Global()
@Module({
  providers: [
    // 全局验证管道
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    // 全局响应拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    // 全局异常过滤器
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // 权限守卫
    RolesGuard,
    PermissionsGuard,
    AdminGuard,
  ],
  exports: [
    // 导出守卫供其他模块使用
    RolesGuard,
    PermissionsGuard,
    AdminGuard,
  ],
})
export class SharedModule {}
