import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('认证模块')
@Controller('auth')
export class AuthController {
  @Get()
  getAuthRoot() {
    return {
      success: true,
      message: '认证模块API',
      data: {
        name: 'MallEco Auth API',
        version: '1.0.0',
        description: '电商生态系统认证API',
        availableEndpoints: {
          login: '/api/auth/login',
          register: '/api/auth/register',
          logout: '/api/auth/logout',
          refreshToken: '/api/auth/refresh',
          verify: '/api/auth/verify',
        },
        documentation: '访问 /api-docs 查看完整的API文档',
      },
    };
  }
}
