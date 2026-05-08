import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache:key';
export const CACHE_TTL_METADATA = 'cache:ttl';
export const CACHE_NAMESPACE_METADATA = 'cache:namespace';

export interface CacheOptions {
  key: string;
  ttl?: number;
  namespace?: string;
}

export const Cache = (options: CacheOptions) => SetMetadata(CACHE_KEY_METADATA, options);

export const CacheKey = (key: string) => SetMetadata(CACHE_KEY_METADATA, { key });

export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_METADATA, ttl);

export const CacheNamespace = (namespace: string) =>
  SetMetadata(CACHE_NAMESPACE_METADATA, namespace);
