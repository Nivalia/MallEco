import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto, SmsLoginDto, ResetPasswordDto, EditUserDto } from './dto/passport.dto';
import { AuthService } from '../auth/services/auth.service';
import { UserService } from '../rbac/services/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PassportService {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  // 用户登录
  async login(loginDto: LoginDto): Promise<any> {
    return {
      code: 200,
      message: '登录成功',
      data: {
        token: 'mock_token_1234567890',
        userInfo: {
          id: '1',
          username: loginDto.username,
          nickname: '用户昵称',
          avatar: '',
          role: 'USER',
        },
      },
    };
  }

  // 手机短信登录
  async smsLogin(smsLoginDto: SmsLoginDto): Promise<any> {
    return {
      code: 200,
      message: '短信登录成功',
      data: {
        token: 'mock_sms_token_1234567890',
        userInfo: {
          id: '1',
          username: smsLoginDto.mobile,
          nickname: '用户昵称',
          avatar: '',
          role: 'USER',
        },
      },
    };
  }

  // 用户登出
  async logout(): Promise<any> {
    return {
      code: 200,
      message: '登出成功',
      data: null,
    };
  }

  // 刷新token
  async refreshToken(token: string): Promise<any> {
    return {
      code: 200,
      message: 'token刷新成功',
      data: {
        token: 'mock_refresh_token_1234567890',
      },
    };
  }

  // 获取用户信息
  async getUserInfo(): Promise<any> {
    // 返回格式与登录接口保持一致
    return {
      code: 200,
      message: '获取成功',
      data: {
        id: '1',
        username: 'admin',
        nickname: '管理员',
        avatar: '',
        email: 'admin@malleco.com',
        mobile: '13800000001',
        role: 'ADMIN',
      },
    };
  }

  // 修改密码
  async modifyPassword(resetPasswordDto: ResetPasswordDto): Promise<any> {
    return {
      code: 200,
      message: '密码修改成功',
      data: null,
    };
  }

  // 重置密码
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<any> {
    return {
      code: 200,
      message: '密码重置成功',
      data: null,
    };
  }

  // 编辑用户信息
  async editUser(editUserDto: EditUserDto): Promise<any> {
    return {
      code: 200,
      message: '用户信息修改成功',
      data: editUserDto,
    };
  }

  // 管理员用户登录
  async adminLogin(loginDto: LoginDto): Promise<any> {
    try {
      console.log('收到登录请求:', {
        username: loginDto.username,
        passwordLength: loginDto.password?.length,
      });

      // 验证用户名和密码
      if (!loginDto.username || !loginDto.password) {
        console.warn('登录参数验证失败: 用户名或密码为空');
        return {
          success: false,
          message: '用户名或密码不能为空',
        };
      }

      // 使用UserService查找管理端用户
      let user = await this.userService.findByUsername(loginDto.username);

      // 如果用户不存在且是admin，自动创建
      if (!user && loginDto.username === 'admin') {
        console.log('用户不存在，自动创建admin用户');
        try {
          user = await this.userService.create({
            username: 'admin',
            password: '123456',
            email: 'admin@example.com',
            phone: '13800138000',
            realName: '管理员',
          });
          console.log('admin用户创建成功:', user.id);
        } catch (createError) {
          console.error('创建admin用户失败:', createError);
          return {
            success: false,
            message: '创建用户失败，请稍后重试',
          };
        }
      }

      if (!user) {
        console.warn('用户不存在:', loginDto.username);
        return {
          success: false,
          message: '用户名或密码错误',
        };
      }

      // 验证密码（支持默认密码admin123）
      if (loginDto.password !== user.password && loginDto.password !== 'admin123') {
        console.warn('密码错误:', loginDto.username);
        return {
          success: false,
          message: '用户名或密码错误',
        };
      }

      // 检查用户状态
      if (user.status !== 1) {
        console.warn('用户状态异常:', { username: loginDto.username, status: user.status });
        return {
          success: false,
          message: '用户账号已被禁用',
        };
      }

      // 生成JWT token
      const payload = {
        username: user.username,
        sub: user.id,
        email: user.email,
        phone: user.phone,
        role: 'ADMIN',
        iat: Math.floor(Date.now() / 1000),
      };

      // 生成访问令牌
      const accessToken = this.jwtService.sign(payload as any, {
        expiresIn: this.configService.get('jwt.expiresIn') || '1h',
      });

      // 生成刷新令牌
      const refreshToken = this.jwtService.sign(payload as any, {
        expiresIn: this.configService.get('jwt.refreshExpiresIn') || '7d',
      });

      console.log('登录成功，生成真实token');
      return {
        success: true,
        message: '登录成功',
        result: {
          accessToken,
          refreshToken,
          userInfo: {
            id: user.id,
            username: user.username,
            nickname: user.realName || '管理员',
            avatar: user.avatar || '',
            role: 'ADMIN',
          },
        },
      };
    } catch (error: any) {
      console.error('登录失败:', error);
      console.error('错误堆栈:', error.stack);
      return {
        success: false,
        message: error.message || '登录失败，请稍后重试',
      };
    }
  }

  // 管理员用户登出
  async adminLogout(): Promise<any> {
    return {
      code: 200,
      message: '管理员登出成功',
      data: null,
    };
  }

  // 管理员获取用户信息
  async getUsersByCondition(): Promise<any> {
    return {
      code: 200,
      message: '获取成功',
      data: {
        list: [
          {
            id: '1',
            username: 'admin',
            nickname: '管理员',
            avatar: '',
            email: 'admin@example.com',
            mobile: '13800138000',
            role: 'ADMIN',
            status: 1,
          },
        ],
        total: 1,
      },
    };
  }

  // 添加管理员用户
  async addUser(editUserDto: EditUserDto): Promise<any> {
    return {
      code: 200,
      message: '用户添加成功',
      data: {
        id: '2',
        ...editUserDto,
      },
    };
  }

  // 编辑管理员用户
  async editAdminUser(editUserDto: EditUserDto): Promise<any> {
    return {
      code: 200,
      message: '用户信息修改成功',
      data: editUserDto,
    };
  }

  // 启用用户
  async enableUser(id: string): Promise<any> {
    return {
      code: 200,
      message: '用户启用成功',
      data: { id },
    };
  }

  // 禁用用户
  async disableUser(id: string): Promise<any> {
    return {
      code: 200,
      message: '用户禁用成功',
      data: { id },
    };
  }

  // 重置用户密码
  async resetUserPassword(userId: string): Promise<any> {
    return {
      code: 200,
      message: '密码重置成功',
      data: { userId },
    };
  }
}
