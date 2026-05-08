import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto, SortDto } from '../../../shared/dto';
import { AnnouncementType, AnnouncementStatus } from '../entities/announcement.entity';

export class CreateAnnouncementDto {
  @ApiProperty({ description: '公告标题' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: '公告内容' })
  @IsString()
  content: string;

  @ApiProperty({ description: '公告类型', enum: AnnouncementType })
  @IsEnum(AnnouncementType)
  type: AnnouncementType;

  @ApiPropertyOptional({ description: '封面图片' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: '优先级' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  priority?: number;

  @ApiPropertyOptional({ description: '是否置顶' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  isTop?: number;

  @ApiPropertyOptional({ description: '发布时间' })
  @IsOptional()
  @IsDateString()
  publishTime?: string;

  @ApiPropertyOptional({ description: '过期时间' })
  @IsOptional()
  @IsDateString()
  expireTime?: string;
}

export class UpdateAnnouncementDto {
  @ApiPropertyOptional({ description: '公告标题' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: '公告内容' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: '公告类型', enum: AnnouncementType })
  @IsOptional()
  @IsEnum(AnnouncementType)
  type?: AnnouncementType;

  @ApiPropertyOptional({ description: '状态', enum: AnnouncementStatus })
  @IsOptional()
  @IsEnum(AnnouncementStatus)
  status?: AnnouncementStatus;

  @ApiPropertyOptional({ description: '封面图片' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: '优先级' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  priority?: number;

  @ApiPropertyOptional({ description: '是否置顶' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  isTop?: number;

  @ApiPropertyOptional({ description: '发布时间' })
  @IsOptional()
  @IsDateString()
  publishTime?: string;

  @ApiPropertyOptional({ description: '过期时间' })
  @IsOptional()
  @IsDateString()
  expireTime?: string;
}

export class QueryAnnouncementDto extends PaginationDto {
  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '公告类型', enum: AnnouncementType })
  @IsOptional()
  @IsEnum(AnnouncementType)
  type?: AnnouncementType;

  @ApiPropertyOptional({ description: '状态', enum: AnnouncementStatus })
  @IsOptional()
  @IsEnum(AnnouncementStatus)
  status?: AnnouncementStatus;

  @ApiPropertyOptional({ description: '是否置顶' })
  @IsOptional()
  @Type(() => Number)
  isTop?: number;
}

export class ListQueryAnnouncementDto extends QueryAnnouncementDto {
  @ApiPropertyOptional({ description: '排序字段', default: 'priority' })
  @IsOptional()
  @IsString()
  orderBy?: string = 'priority';

  @ApiPropertyOptional({ description: '排序方式', enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsString()
  orderType?: 'ASC' | 'DESC' = 'DESC';
}
