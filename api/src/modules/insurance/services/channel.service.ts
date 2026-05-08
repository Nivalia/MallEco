import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from '../entities/channel.entity';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { UpdateChannelDto } from '../dto/update-channel.dto';
import { PaginationDto } from '@shared/dto/common.dto';
import { AdvancedCacheService } from '@infrastructure/cache/advanced-cache.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChannelService {
  private readonly DEFAULT_CACHE_TTL = 3600; // 1小时
  private readonly CACHE_KEY_PREFIX = 'insurance:channel';

  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    private readonly cacheService: AdvancedCacheService,
    private readonly configService: ConfigService,
  ) {
    const insuranceCacheConfig = this.configService.get('performance.cache.modules.insurance');
    if (insuranceCacheConfig) {
      this.DEFAULT_CACHE_TTL = insuranceCacheConfig.ttl;
    }
  }

  private async clearChannelCache(
    id?: string,
    channelCode?: string,
    parentId?: string,
  ): Promise<void> {
    // 清除渠道列表缓存
    await this.cacheService.clearCache(`${this.CACHE_KEY_PREFIX}:list:*`);

    // 清除特定渠道缓存
    if (id) {
      await this.cacheService.clearCache(`${this.CACHE_KEY_PREFIX}:${id}`);
    }

    // 清除按代码查询的缓存
    if (channelCode) {
      await this.cacheService.clearCache(`${this.CACHE_KEY_PREFIX}:code:${channelCode}`);
    }

    // 清除按父渠道查询的缓存
    if (parentId) {
      await this.cacheService.clearCache(`${this.CACHE_KEY_PREFIX}:parent:${parentId}`);
      await this.cacheService.clearCache(`${this.CACHE_KEY_PREFIX}:downstream:${parentId}`);
    }
  }

  async create(createChannelDto: CreateChannelDto): Promise<Channel> {
    const channel = this.channelRepository.create({
      ...createChannelDto,
      parentId: createChannelDto.parentId?.toString() || '0',
    });
    const result = await this.channelRepository.save(channel);

    // 创建成功后清除相关缓存
    await this.clearChannelCache(undefined, undefined, result.parentId);

    return result;
  }

  async findAll(paginationDto: PaginationDto): Promise<{ data: Channel[]; total: number }> {
    const { page = 1, pageSize = 10, keyword } = paginationDto;
    const cacheKey = `${this.CACHE_KEY_PREFIX}:list:page=${page}:size=${pageSize}:keyword=${keyword || 'null'}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        const queryBuilder = this.channelRepository
          .createQueryBuilder('channel')
          .leftJoinAndSelect('channel.parent', 'parent');

        if (keyword) {
          queryBuilder.andWhere(
            'channel.channelName LIKE :keyword OR channel.channelCode LIKE :keyword OR channel.contactPerson LIKE :keyword OR channel.contactPhone LIKE :keyword',
            { keyword: `%${keyword}%` },
          );
        }

        const [data, total] = await queryBuilder
          .skip((page - 1) * pageSize)
          .take(pageSize)
          .orderBy('channel.sortOrder', 'ASC')
          .addOrderBy('channel.createTime', 'DESC')
          .getManyAndCount();

        return { data, total };
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  async findOne(id: string): Promise<Channel> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:${id}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        const channel = await this.channelRepository.findOne({
          where: { id },
          relations: ['parent'],
        });

        if (!channel) {
          throw new NotFoundException(`渠道 ID ${id} 不存在`);
        }

        return channel;
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  async findByCode(channelCode: string): Promise<Channel | null> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:code:${channelCode}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        return await this.channelRepository.findOne({
          where: { channelCode },
        });
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  async findByParent(parentId: string): Promise<Channel[]> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:parent:${parentId}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        return await this.channelRepository.find({
          where: { parentId, status: 1 },
        });
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  async findDownstreamChannels(channelId: string): Promise<Channel[]> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:downstream:${channelId}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        return await this.channelRepository.find({
          where: { parentId: channelId, status: 1 },
        });
      },
      this.DEFAULT_CACHE_TTL,
    );
  }

  async update(id: string, updateChannelDto: UpdateChannelDto): Promise<Channel> {
    const channel = await this.findOne(id);
    const oldChannelCode = channel.channelCode;
    const oldParentId = channel.parentId;

    Object.assign(channel, updateChannelDto);
    const result = await this.channelRepository.save(channel);

    // 更新成功后清除相关缓存
    await this.clearChannelCache(id, oldChannelCode, oldParentId);

    // 如果渠道代码或父ID发生变化，清除新值的缓存
    if (updateChannelDto.channelCode && updateChannelDto.channelCode !== oldChannelCode) {
      await this.clearChannelCache(undefined, updateChannelDto.channelCode);
    }
    if (updateChannelDto.parentId && updateChannelDto.parentId?.toString() !== oldParentId) {
      await this.clearChannelCache(undefined, undefined, updateChannelDto.parentId?.toString());
    }

    return result;
  }

  async remove(id: string): Promise<void> {
    const channel = await this.findOne(id);
    const channelCode = channel.channelCode;
    const parentId = channel.parentId;

    channel.isDel = 1;
    await this.channelRepository.save(channel);

    // 删除成功后清除相关缓存
    await this.clearChannelCache(id, channelCode, parentId);
  }
}
