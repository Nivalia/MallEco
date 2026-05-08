import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/users.service';
import { User, UserStatus } from '../../users/entities/user.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: '1',
    username: 'testuser',
    password: 'hashedpassword',
    email: 'test@example.com',
    phone: '13800138000',
    nickname: '测试用户',
    avatar: '',
    status: UserStatus.ACTIVE,
    lastLoginTime: new Date(),
    lastLoginIp: '127.0.0.1',
    gender: null,
    birthday: null,
    location: null,
    isVip: 0,
    vipExpireTime: null,
    points: 0,
    balance: 0,
    socialAuths: [],
    createTime: new Date(),
    updateTime: new Date(),
    isDel: 0,
  } as unknown as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByUsername: jest.fn() as (
              this: void,
              username: string,
            ) => Promise<User | undefined>,
            findByEmail: jest.fn() as (this: void, email: string) => Promise<User | undefined>,
            findByPhone: jest.fn() as (this: void, phone: string) => Promise<User | undefined>,
            create: jest.fn() as (this: void, user: any) => Promise<User>,
            update: jest.fn() as (this: void, id: string, user: any) => Promise<User>,
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn() as (this: void, payload: any, options?: any) => string,
            verify: jest.fn() as (this: void, token: string, options?: any) => any,
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('validateUser', () => {
    it('应该返回有效的用户对象，当用户名和密码正确时', async () => {
      // Arrange
      usersService.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await authService.validateUser('testuser', 'password123');

      // Assert
      expect(result).toEqual(mockUser);
      expect(usersService.findByUsername).toHaveBeenCalledWith('testuser');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
    });

    it('应该通过邮箱查找用户并验证成功', async () => {
      // Arrange
      usersService.findByUsername.mockResolvedValue(undefined);
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await authService.validateUser('test@example.com', 'password123');

      // Assert
      expect(result).toEqual(mockUser);
      expect(usersService.findByUsername).toHaveBeenCalledWith('test@example.com');
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
    });

    it('应该通过手机号查找用户并验证成功', async () => {
      // Arrange
      usersService.findByUsername.mockResolvedValue(undefined);
      usersService.findByEmail.mockResolvedValue(undefined);
      usersService.findByPhone.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await authService.validateUser('13800138000', 'password123');

      // Assert
      expect(result).toEqual(mockUser);
      expect(usersService.findByPhone).toHaveBeenCalledWith('13800138000');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
    });

    it('应该返回null，当密码不匹配时', async () => {
      // Arrange
      usersService.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await authService.validateUser('testuser', 'wrongpassword');

      // Assert
      expect(result).toBeNull();
    });

    it('应该返回null，当用户不存在时', async () => {
      // Arrange
      usersService.findByUsername.mockResolvedValue(undefined);
      usersService.findByEmail.mockResolvedValue(undefined);
      usersService.findByPhone.mockResolvedValue(undefined);

      // Act
      const result = await authService.validateUser('nonexistent', 'password123');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      username: 'testuser',
      password: 'password123',
    };

    it('应该返回访问令牌和刷新令牌，当登录成功时', async () => {
      // Arrange
      const mockAccessToken = 'mock-access-token';
      const mockRefreshToken = 'mock-refresh-token';

      usersService.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValueOnce(mockAccessToken).mockReturnValueOnce(mockRefreshToken);
      usersService.update.mockResolvedValue(mockUser);

      // Act
      const result = await authService.login(loginDto);

      // Assert
      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        user: mockUser,
      });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(usersService.update).toHaveBeenCalledWith(mockUser.id, {
        last_login_time: expect.any(Date),
        last_login_ip: '127.0.0.1',
      });
    });

    it('应该抛出UnauthorizedException，当用户名或密码错误时', async () => {
      // Arrange
      usersService.findByUsername.mockResolvedValue(undefined);
      usersService.findByEmail.mockResolvedValue(undefined);
      usersService.findByPhone.mockResolvedValue(undefined);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(authService.login(loginDto)).rejects.toThrow('用户名或密码错误');
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      username: 'newuser',
      password: 'password123',
      email: 'new@example.com',
      phone: '13900139000',
      nickname: '新用户',
    };

    it('应该成功注册新用户', async () => {
      // Arrange
      const hashedPassword = 'hashedpassword123';
      const newUser = { ...mockUser, id: '2', username: 'newuser', email: 'new@example.com' };

      usersService.findByUsername.mockResolvedValue(undefined);
      usersService.findByEmail.mockResolvedValue(undefined);
      usersService.findByPhone.mockResolvedValue(undefined);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      usersService.create.mockResolvedValue(newUser);

      // Act
      const result = await authService.register(registerDto);

      // Assert
      expect(result).toEqual(newUser);
      expect(usersService.create).toHaveBeenCalledWith({
        username: 'newuser',
        password: hashedPassword,
        email: 'new@example.com',
        phone: '13900139000',
        nickname: '新用户',
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('应该抛出ConflictException，当用户名已存在时', async () => {
      // Arrange
      usersService.findByUsername.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(authService.register(registerDto)).rejects.toThrow('用户名已存在');
    });

    it('应该抛出ConflictException，当邮箱已存在时', async () => {
      // Arrange
      usersService.findByUsername.mockResolvedValue(undefined);
      usersService.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(authService.register(registerDto)).rejects.toThrow('邮箱已存在');
    });

    it('应该抛出ConflictException，当手机号已存在时', async () => {
      // Arrange
      usersService.findByUsername.mockResolvedValue(undefined);
      usersService.findByEmail.mockResolvedValue(undefined);
      usersService.findByPhone.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(authService.register(registerDto)).rejects.toThrow('手机号已存在');
    });
  });

  describe('refreshToken', () => {
    it('应该返回新的访问令牌，当刷新令牌有效时', async () => {
      // Arrange
      const mockRefreshToken = 'valid-refresh-token';
      const mockNewAccessToken = 'new-access-token';
      const mockPayload = { username: 'testuser', sub: '1' };

      jwtService.verify.mockReturnValue(mockPayload);
      jwtService.sign.mockReturnValue(mockNewAccessToken);

      // Act
      const result = await authService.refreshToken(mockRefreshToken);

      // Assert
      expect(result).toEqual({ accessToken: mockNewAccessToken });
      expect(jwtService.verify).toHaveBeenCalledWith(mockRefreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      });
      expect(jwtService.sign).toHaveBeenCalledWith(
        { username: mockPayload.username, sub: mockPayload.sub },
        expect.any(Object),
      );
    });

    it('应该抛出UnauthorizedException，当刷新令牌无效时', async () => {
      // Arrange
      const invalidRefreshToken = 'invalid-refresh-token';

      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(authService.refreshToken(invalidRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.refreshToken(invalidRefreshToken)).rejects.toThrow('无效的刷新令牌');
    });
  });
});
