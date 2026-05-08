import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const SKIP_AUTH_KEY = 'skipAuth';
export const SkipAuth = () => SetMetadata(SKIP_AUTH_KEY, true);

export const PERMISSION_KEY = 'permissions';
export const Permissions = (...permissions: string[]) => SetMetadata(PERMISSION_KEY, permissions);
