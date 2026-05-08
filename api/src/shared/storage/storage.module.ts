import { Global, Module } from '@nestjs/common';
import { StorageService, StorageFactory, LocalStorageService } from './storage.service';

/**
 * 文件存储模块
 *
 * 使用方法:
 * import { StorageModule } from '@shared/storage/storage.module';
 *
 * @Module({
 *   imports: [StorageModule],
 * })
 */
@Global()
@Module({
  providers: [
    LocalStorageService,
    StorageFactory,
    {
      provide: StorageService,
      useClass: LocalStorageService,
    },
  ],
  exports: [StorageService, StorageFactory],
})
export class StorageModule {}
