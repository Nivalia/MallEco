/**
 * 文件存储类型
 */
export enum StorageType {
  LOCAL = 'local',
  OSS = 'oss',
  COS = 'cos',
  OBS = 'obs',
  S3 = 's3',
}

/**
 * 文件存储配置接口
 */
export interface StorageConfig {
  /**
   * 存储类型
   */
  type: StorageType;

  /**
   * 本地存储配置
   */
  local?: {
    basePath: string;
    prefix: string;
  };

  /**
   * OSS 配置
   */
  oss?: {
    endpoint: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
    prefix?: string;
  };

  /**
   * COS 配置
   */
  cos?: {
    secretId: string;
    secretKey: string;
    bucket: string;
    region: string;
    prefix?: string;
  };

  /**
   * OBS 配置
   */
  obs?: {
    endpoint: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
    prefix?: string;
  };

  /**
   * S3 配置
   */
  s3?: {
    endpoint: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucket: string;
    region?: string;
  };
}

/**
 * 文件元数据
 */
export interface FileMetadata {
  /**
   * 文件名
   */
  filename: string;

  /**
   * 原始文件名
   */
  originalName: string;

  /**
   * MIME 类型
   */
  mimeType: string;

  /**
   * 文件大小(字节)
   */
  size: number;

  /**
   * 扩展名
   */
  extension: string;

  /**
   * 存储路径
   */
  path: string;

  /**
   * 访问 URL
   */
  url: string;

  /**
   * 上传时间
   */
  uploadedAt: Date;
}

/**
 * 文件上传选项
 */
export interface UploadOptions {
  /**
   * 目录
   */
  directory?: string;

  /**
   * 文件名前缀
   */
  prefix?: string;

  /**
   * 最大大小(字节)
   */
  maxSize?: number;

  /**
   * 允许的 MIME 类型
   */
  allowedMimeTypes?: string[];

  /**
   * 允许的扩展名
   */
  allowedExtensions?: string[];
}
