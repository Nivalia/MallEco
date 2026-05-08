import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull } from 'typeorm';
import { User } from './entities/user.entity';
import { CacheProtectionService } from '../../infrastructure/cache/cache-protection.service';
import { ErrorCode, getErrorMessage } from '../../shared/exceptions/error-code';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from './dto';
import { PaginatedResponse, PaginatedResponseDto } from '../../shared/dto/response.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cacheProtectionService: CacheProtectionService,
  ) {}

  async create(createDto: CreateUserDto): Promise<User> {
    const { username, email, phone } = createDto;

    const existUser = await this.userRepository.findOne({
      where: [{ username }, ...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
    });

    if (existUser) {
      if (existUser.username === username) {
        throw new ConflictException({
          code: ErrorCode.USR_ALREADY_EXISTS,
          message: '用户名已存在',
        });
      }
      if (email && existUser.email === email) {
        throw new ConflictException({
          code: ErrorCode.USR_ALREADY_EXISTS,
          message: '邮箱已被使用',
        });
      }
      if (phone && existUser.phone === phone) {
        throw new ConflictException({
          code: ErrorCode.USR_ALREADY_EXISTS,
          message: '手机号已被使用',
        });
      }
    }

    const user = this.userRepository.create(createDto);
    const result = await this.userRepository.save(user);

    this.logger.log(`用户创建成功: ${result.id}`, 'UsersService');

    return result;
  }

  async findAll(query: QueryUserDto): Promise<PaginatedResponse<User>> {
    const {
      page = 1,
      limit = 10,
      keyword,
      username,
      email,
      phone,
      status,
      isVip,
      orderBy = 'createdAt',
      orderType = 'DESC',
    } = query;

    const where: any = [];

    if (keyword) {
      where.push(
        { username: Like(`%${keyword}%`) },
        { nickname: Like(`%${keyword}%`) },
        { email: Like(`%${keyword}%`) },
        { phone: Like(`%${keyword}%`) },
      );
    } else {
      if (username) where.push({ username });
      if (email) where.push({ email });
      if (phone) where.push({ phone });
    }

    if (status) where.push({ status });
    if (isVip !== undefined) where.push({ isVip });

    const [list, total] = await this.userRepository.findAndCount({
      where: where.length > 0 ? where : undefined,
      order: { [orderBy]: orderType },
      skip: (page - 1) * limit,
      take: limit,
    });

    return PaginatedResponseDto.create(list, total, page, limit);
  }

  async findAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findById(id: string): Promise<User> {
    const cacheKey = `user:id:${id}`;

    const user = await this.cacheProtectionService.getWithPenetrationProtection(
      cacheKey,
      async () => {
        return await this.userRepository.findOne({
          where: { id },
        });
      },
      3600,
    );

    if (!user) {
      throw new NotFoundException({
        code: ErrorCode.USR_NOT_FOUND,
        message: getErrorMessage(ErrorCode.USR_NOT_FOUND),
      });
    }

    return user;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const cacheKey = `user:username:${username}`;

    return await this.cacheProtectionService.getWithPenetrationProtection(
      cacheKey,
      async () => {
        return await this.userRepository.findOne({
          where: { username },
        });
      },
      3600,
    );
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const cacheKey = `user:email:${email}`;

    return await this.cacheProtectionService.getWithPenetrationProtection(
      cacheKey,
      async () => {
        return await this.userRepository.findOne({
          where: { email },
        });
      },
      3600,
    );
  }

  async findByPhone(phone: string): Promise<User | undefined> {
    const cacheKey = `user:phone:${phone}`;

    return await this.cacheProtectionService.getWithPenetrationProtection(
      cacheKey,
      async () => {
        return await this.userRepository.findOne({
          where: { phone },
        });
      },
      3600,
    );
  }

  async findByCondition(query: {
    username?: string;
    email?: string;
    phone?: string;
  }): Promise<User | undefined> {
    if (query.username) {
      return this.findByUsername(query.username);
    } else if (query.email) {
      return this.findByEmail(query.email);
    } else if (query.phone) {
      return this.findByPhone(query.phone);
    }
    return undefined;
  }

  async update(id: string, updateDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException({
        code: ErrorCode.USR_NOT_FOUND,
        message: getErrorMessage(ErrorCode.USR_NOT_FOUND),
      });
    }

    if (updateDto.username && updateDto.username !== user.username) {
      const existUser = await this.findByUsername(updateDto.username);
      if (existUser) {
        throw new ConflictException({
          code: ErrorCode.USR_ALREADY_EXISTS,
          message: '用户名已存在',
        });
      }
    }

    if (updateDto.email && updateDto.email !== user.email) {
      const existUser = await this.findByEmail(updateDto.email);
      if (existUser) {
        throw new ConflictException({
          code: ErrorCode.USR_ALREADY_EXISTS,
          message: '邮箱已被使用',
        });
      }
    }

    if (updateDto.phone && updateDto.phone !== user.phone) {
      const existUser = await this.findByPhone(updateDto.phone);
      if (existUser) {
        throw new ConflictException({
          code: ErrorCode.USR_ALREADY_EXISTS,
          message: '手机号已被使用',
        });
      }
    }

    Object.assign(user, updateDto);

    const updatedUser = await this.userRepository.save(user);

    await this.clearUserCache(updatedUser);

    this.logger.log(`用户更新成功: ${id}`, 'UsersService');

    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException({
        code: ErrorCode.USR_NOT_FOUND,
        message: getErrorMessage(ErrorCode.USR_NOT_FOUND),
      });
    }

    await this.userRepository.softDelete(id);

    await this.clearUserCache(user);

    this.logger.log(`用户删除成功: ${id}`, 'UsersService');
  }

  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException({
        code: ErrorCode.USR_NOT_FOUND,
        message: getErrorMessage(ErrorCode.USR_NOT_FOUND),
      });
    }

    if (user.password && user.password !== oldPassword) {
      throw new BadRequestException({
        code: ErrorCode.USR_PASSWORD_ERROR,
        message: getErrorMessage(ErrorCode.USR_PASSWORD_ERROR),
      });
    }

    user.password = newPassword;
    await this.userRepository.save(user);

    await this.clearUserCache(user);

    this.logger.log(`用户密码修改成功: ${id}`, 'UsersService');
  }

  async updateBalance(id: string, amount: number, operation: 'add' | 'subtract'): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException({
        code: ErrorCode.USR_NOT_FOUND,
        message: getErrorMessage(ErrorCode.USR_NOT_FOUND),
      });
    }

    if (operation === 'subtract' && user.balance < amount) {
      throw new BadRequestException({
        code: ErrorCode.USR_INSUFFICIENT_PERMISSION,
        message: getErrorMessage(ErrorCode.USR_INSUFFICIENT_PERMISSION),
      });
    }

    if (operation === 'add') {
      user.balance = Number(user.balance) + amount;
    } else {
      user.balance = Number(user.balance) - amount;
    }

    const result = await this.userRepository.save(user);

    await this.clearUserCache(result);

    return result;
  }

  private async clearUserCache(user: User): Promise<void> {
    const cacheKeys = [`user:id:${user.id}`, `user:username:${user.username}`];

    if (user.email) cacheKeys.push(`user:email:${user.email}`);
    if (user.phone) cacheKeys.push(`user:phone:${user.phone}`);

    await this.cacheProtectionService.deleteBatch(cacheKeys);
  }
}
