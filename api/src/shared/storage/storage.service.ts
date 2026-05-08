import { Injectable, Logger } from '@nestjs/common';
import { StorageType, StorageConfig, FileMetadata, UploadOptions } from './storage.config';

/**
 * 文件存储服务抽象
 */
@Injectable()
export abstract class StorageService {
  protected readonly logger = new Logger(StorageService.name);

  /**
   * 获取存储类型
   */
  abstract getType(): StorageType;

  /**
   * 上传文件
   */
  abstract upload(buffer: Buffer, filename: string, options?: UploadOptions): Promise<FileMetadata>;

  /**
   * 删除文件
   */
  abstract delete(path: string): Promise<void>;

  /**
   * 获取文件 URL
   */
  abstract getUrl(path: string): string;

  /**
   * 复制文件
   */
  abstract copy(sourcePath: string, destPath: string): Promise<void>;

  /**
   * 检查文件是否存在
   */
  abstract exists(path: string): Promise<boolean>;
}

/**
 * 本地存储服务
 */
@Injectable()
export class LocalStorageService extends StorageService {
  private readonly basePath: string;
  private readonly prefix: string;

  constructor(config: StorageConfig) {
    super();
    this.basePath = config.local?.basePath || './uploads';
    this.prefix = config.local?.prefix || '/uploads';
  }

  getType(): StorageType {
    return StorageType.LOCAL;
  }

  async upload(buffer: Buffer, filename: string, options?: UploadOptions): Promise<FileMetadata> {
    // 简化实现
    const path = `${options?.directory || 'default'}/${Date.now()}-${filename}`;
    // 实际应写入文件系统
    this.logger.log(`File uploaded: ${path}`);

    return {
      filename,
      originalName: filename,
      mimeType: 'application/octet-stream',
      size: buffer.length,
      extension: filename.split('.').pop() || '',
      path,
      url: `${this.prefix}/${path}`,
      uploadedAt: new Date(),
    };
  }

  async delete(path: string): Promise<void> {
    this.logger.log(`File deleted: ${path}`);
  }

  getUrl(path: string): string {
    return `${this.prefix}/${path}`;
  }

  async copy(sourcePath: string, destPath: string): Promise<void> {
    this.logger.log(`File copied: ${sourcePath} -> ${destPath}`);
  }

  async exists(path: string): Promise<boolean> {
    return true;
  }
}

/**
 * 存储工厂
 */
@Injectable()
export class StorageFactory {
  create(config: StorageConfig): StorageService {
    switch (config.type) {
      case StorageType.LOCAL:
        return new LocalStorageService(config);
      case StorageType.OSS:
        // return new OssStorageService(config);
        throw new Error('OSS storage not implemented');
      case StorageType.COS:
        // return new CosStorageService(config);
        throw new Error('COS storage not implemented');
      case StorageType.OBS:
        // return new ObsStorageService(config);
        throw new Error('OBS storage not implemented');
      case StorageType.S3:
        // return new S3StorageService(config);
        throw new Error('S3 storage not implemented');
      default:
        throw new Error(`Unsupported storage type: ${config.type}`);
    }
  }
}
