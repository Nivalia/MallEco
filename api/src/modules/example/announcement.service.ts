import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull } from 'typeorm';
import { Announcement, AnnouncementStatus, AnnouncementType } from './entities/announcement.entity';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  ListQueryAnnouncementDto,
} from './dto/announcement.dto';
import { ErrorCode, getErrorMessage } from '../../shared/exceptions/error-code';
import { PaginatedResponse, PaginatedResponseDto } from '../../shared/dto/response.dto';

@Injectable()
export class AnnouncementService {
  private readonly logger = new Logger(AnnouncementService.name);

  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepository: Repository<Announcement>,
  ) {}

  async create(createDto: CreateAnnouncementDto): Promise<Announcement> {
    const announcement = this.announcementRepository.create(createDto);
    const result = await this.announcementRepository.save(announcement);
    this.logger.log(`公告创建成功: ${result.id}`, 'AnnouncementService');
    return result;
  }

  async findAll(query: ListQueryAnnouncementDto): Promise<PaginatedResponse<Announcement>> {
    const {
      page = 1,
      limit = 10,
      keyword,
      type,
      status,
      isTop,
      orderBy = 'priority',
      orderType = 'DESC',
    } = query;

    const where: any = {};

    if (keyword) {
      where.title = Like(`%${keyword}%`);
    }
    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }
    if (isTop !== undefined) {
      where.isTop = isTop;
    }

    const order: any = {};
    order[orderBy] = orderType;

    const [list, total] = await this.announcementRepository.findAndCount({
      where,
      order,
      skip: (page - 1) * limit,
      take: limit,
    });

    return PaginatedResponseDto.create(list, total, page, limit);
  }

  async findOne(id: string): Promise<Announcement> {
    const announcement = await this.announcementRepository.findOne({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException({
        code: ErrorCode.GLO_NOT_FOUND,
        message: getErrorMessage(ErrorCode.GLO_NOT_FOUND),
      });
    }

    await this.announcementRepository.increment({ id }, 'viewCount', 1);

    return announcement;
  }

  async findPublished(query: ListQueryAnnouncementDto): Promise<PaginatedResponse<Announcement>> {
    const { page = 1, limit = 10, type } = query;
    const now = new Date();

    const where: any = {
      status: AnnouncementStatus.PUBLISHED,
      publishTime: IsNull(),
    };

    if (type) {
      where.type = type;
    }

    const [list, total] = await this.announcementRepository.findAndCount({
      where: [
        { ...where, publishTime: IsNull(), expireTime: IsNull() },
        { ...where, publishTime: Like('%') },
      ],
      order: { isTop: 'DESC', priority: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return PaginatedResponseDto.create(list, total, page, limit);
  }

  async update(id: string, updateDto: UpdateAnnouncementDto): Promise<Announcement> {
    const announcement = await this.findOne(id);

    Object.assign(announcement, updateDto);

    const result = await this.announcementRepository.save(announcement);
    this.logger.log(`公告更新成功: ${id}`, 'AnnouncementService');

    return result;
  }

  async remove(id: string): Promise<void> {
    const result = await this.announcementRepository.softDelete({ id });

    if (result.affected === 0) {
      throw new NotFoundException({
        code: ErrorCode.GLO_NOT_FOUND,
        message: getErrorMessage(ErrorCode.GLO_NOT_FOUND),
      });
    }

    this.logger.log(`公告删除成功: ${id}`, 'AnnouncementService');
  }

  async publish(id: string): Promise<Announcement> {
    const announcement = await this.findOne(id);

    if (announcement.status === AnnouncementStatus.PUBLISHED) {
      throw new ConflictException({
        code: ErrorCode.GLO_CONFLICT,
        message: '公告已发布',
      });
    }

    announcement.status = AnnouncementStatus.PUBLISHED;
    announcement.publishTime = new Date();

    return this.announcementRepository.save(announcement);
  }
}
