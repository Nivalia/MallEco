import { SetMetadata } from '@nestjs/common';

export const ROLE_KEY = 'roles';
export { PERMISSION_KEY, Permissions } from './auth.decorator';

export const Roles = (...roles: string[]) => SetMetadata(ROLE_KEY, roles);
