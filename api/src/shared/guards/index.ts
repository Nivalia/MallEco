import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY, PERMISSION_KEY } from '../decorators/rbac.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('用户未登录');
    }

    const hasRole = requiredRoles.some(role => user.roles?.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('没有权限访问该资源');
    }

    return true;
  }
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('用户未登录');
    }

    const hasPermission = requiredPermissions.every(permission =>
      user.permissions?.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('没有权限访问该资源');
    }

    return true;
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('用户未登录');
    }

    if (user.isAdmin !== true && user.role !== 'admin') {
      throw new ForbiddenException('需要管理员权限');
    }

    return true;
  }
}
