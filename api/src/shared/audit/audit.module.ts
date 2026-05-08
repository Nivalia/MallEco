import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './audit-log.entity';
import { AuditService } from './audit.service';

/**
 * 审计日志模块
 *
 * 使用方法:
 * import { AuditModule } from '@shared/audit/audit.module';
 *
 * @Module({
 *   imports: [AuditModule],
 * })
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
