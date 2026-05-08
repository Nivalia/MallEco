import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { User, UserStatus } from '../../users/entities/user.entity';
import jwtConfig from '../../../config/jwt.config';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { Logger } from '@nestjs/common';

interface JwtConfig {
  secret: string;
  refreshSecret: string;
  expiresIn: string;
  refreshExpiresIn: string;
  algorithm: string;
  audience: string;
  issuer: string;
  blacklistEnabled: boolean;
}

interface JwtPayload {
  username: string;
  sub: string;
  email?: string;
  phone?: string;
  role: string;
  iat: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 12;
  private readonly TOKEN_BLACKLIST_PREFIX = 'token:blacklist:';

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    @Inject(jwtConfig.KEY) private readonly jwtConfig: JwtConfig,
  ) {}

  /**
   * 验证用户凭据
   * @param username 用户名/邮箱/手机号
   * @param password 密码
   * @returns 用户信息或null
   */
  async validateUser(username: string, password: string): Promise<User | null> {
    // 尝试通过用户名、邮箱或手机号查找用户
    let user: User | undefined;

    user = await this.usersService.findByUsername(username);
    if (!user) {
      user = await this.usersService.findByEmail(username);
    }
    if (!user) {
      user = await this.usersService.findByPhone(username);
    }

    if (user && user.password) {
      // 验证密码
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        // 检查用户是否被禁用
        if (user.status === UserStatus.BANNED || user.status === UserStatus.INACTIVE) {
          throw new UnauthorizedException('用户账号已被禁用');
        }
        return user;
      }
    }

    return null;
  }

  /**
   * 用户登录
   * @param loginDto 登录信息
   * @param ipAddress IP地址
   * @param userAgent 用户代理
   * @returns 访问令牌、刷新令牌和用户信息
   */
  async login(
    loginDto: LoginDto,
    ipAddress: string = '127.0.0.1',
    _userAgent: string = '',
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const { username, password } = loginDto;
    const user = await this.validateUser(username, password);

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 生成JWT载荷
    const payload = {
      username: user.username,
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: 'user',
      iat: Math.floor(Date.now() / 1000),
    };

    // 生成访问令牌
    // TODO(@typescript-eslint/ban-ts-comment): NestJS JWT 11 类型定义问题，需要使用 as any
    // @ts-ignore - NestJS JWT 11 typing issue with sign method
    const accessToken = this.jwtService.sign(payload as any, {
      expiresIn: this.jwtConfig.expiresIn as any,
    });

    // 生成刷新令牌
    // @ts-ignore - NestJS JWT 11 typing issue with sign method
    const refreshToken = this.jwtService.sign(payload as any, {
      expiresIn: this.jwtConfig.refreshExpiresIn as any,
    });

    // 更新用户最后登录信息
    await this.usersService.update(user.id, {
      last_login_time: new Date(),
      last_login_ip: ipAddress,
    });

    this.logger.log(`用户登录成功: ${user.username}, IP: ${ipAddress}`);

    return { accessToken, refreshToken, user };
  }

  /**
   * 用户注册
   * @param registerDto 注册信息
   * @returns 用户信息
   */
  async register(registerDto: RegisterDto): Promise<User> {
    const { username, email, phone, password, nickname } = registerDto;

    // 检查用户名是否已存在
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingEmail = await this.usersService.findByEmail(email);
    if (existingEmail) {
      throw new ConflictException('邮箱已存在');
    }

    // 检查手机号是否已存在
    if (phone) {
      const existingPhone = await this.usersService.findByPhone(phone);
      if (existingPhone) {
        throw new ConflictException('手机号已存在');
      }
    }

    // 密码强度验证
    this.validatePasswordStrength(password);

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    // 创建用户
    const user = await this.usersService.create({
      username,
      password: hashedPassword,
      email,
      phone,
      nickname,
      status: UserStatus.ACTIVE, // 默认为启用状态
    });

    this.logger.log(`用户注册成功: ${user.username}`);

    return user;
  }

  /**
   * 刷新访问令牌
   * @param refreshToken 刷新令牌
   * @returns 新的访问令牌
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // 检查令牌是否在黑名单中
      if (await this.isTokenBlacklisted(refreshToken)) {
        throw new UnauthorizedException('刷新令牌已被撤销');
      }

      // 验证刷新令牌
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.jwtConfig.refreshSecret,
        audience: this.jwtConfig.audience,
        issuer: this.jwtConfig.issuer,
        ignoreExpiration: false,
      });

      // 生成新的访问令牌
      // @ts-ignore - NestJS JWT 11 typing issue with sign method
      const newAccessToken = this.jwtService.sign(
        {
          username: payload.username,
          sub: payload.sub,
          email: payload.email,
          phone: payload.phone,
          role: 'user',
          iat: Math.floor(Date.now() / 1000),
        } as any,
        {
          expiresIn: this.jwtConfig.expiresIn as any,
        },
      );

      return { accessToken: newAccessToken };
    } catch (_error) {
      throw new UnauthorizedException('无效的刷新令牌');
    }
  }

  /**
   * 用户登出
   * @param accessToken 访问令牌
   * @param refreshToken 刷新令牌
   */
  async logout(accessToken: string, refreshToken: string): Promise<void> {
    // 将令牌加入黑名单
    if (accessToken) {
      await this.blacklistToken(accessToken);
    }
    if (refreshToken) {
      await this.blacklistToken(refreshToken);
    }

    this.logger.log('用户登出成功');
  }

  /**
   * 验证密码强度
   * @param password 密码
   */
  private validatePasswordStrength(password: string): void {
    // 密码长度至少8位
    if (password.length < 8) {
      throw new ConflictException('密码长度至少8位');
    }

    // 密码必须包含字母和数字
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      throw new ConflictException('密码必须包含字母和数字');
    }

    // 密码可以包含特殊字符
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      this.logger.warn('密码建议包含特殊字符以提高安全性');
    }
  }

  /**
   * 将令牌加入黑名单
   * @param token 令牌
   */
  private async blacklistToken(token: string): Promise<void> {
    if (!this.jwtConfig.blacklistEnabled) {
      return;
    }

    try {
      // 提取令牌中的过期时间
      const decoded = this.jwtService.decode(token);
      if (decoded && typeof decoded === 'object' && 'exp' in decoded) {
        const expiresAt = decoded.exp as number;
        const now = Math.floor(Date.now() / 1000);
        const ttl = expiresAt - now;

        if (ttl > 0) {
          // 生成令牌哈希作为键
          const tokenHash = this.generateTokenHash(token);
          await this.redisService.set(`${this.TOKEN_BLACKLIST_PREFIX}${tokenHash}`, '1', ttl);
        }
      }
    } catch (_error) {
      this.logger.error('将令牌加入黑名单失败:', _error);
    }
  }

  /**
   * 检查令牌是否在黑名单中
   * @param token 令牌
   * @returns 是否在黑名单中
   */
  private async isTokenBlacklisted(token: string): Promise<boolean> {
    if (!this.jwtConfig.blacklistEnabled) {
      return false;
    }

    try {
      const tokenHash = this.generateTokenHash(token);
      const exists = await this.redisService.exists(`${this.TOKEN_BLACKLIST_PREFIX}${tokenHash}`);
      return exists === 1;
    } catch (error) {
      this.logger.error('检查令牌黑名单状态失败:', error);
      return false;
    }
  }

  /**
   * 生成令牌哈希
   * @param token 令牌
   * @returns 哈希值
   */
  private generateTokenHash(token: string): string {
    // 使用简单的哈希方法，实际生产环境可以使用更安全的算法
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * 重置用户密码
   * @param userId 用户ID
   * @param oldPassword 旧密码
   * @param newPassword 新密码
   */
  async resetPassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 验证旧密码
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('旧密码错误');
    }

    // 验证新密码强度
    this.validatePasswordStrength(newPassword);

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // 更新密码
    await this.usersService.update(userId, {
      password: hashedPassword,
    });

    this.logger.log(`用户密码重置成功: ${user.username}`);
  }
}
