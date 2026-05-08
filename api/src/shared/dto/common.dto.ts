import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsString, IsArray, IsNumber, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ description: '页码', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: '每页数量(别名)', default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;

  get skip(): number {
    return ((this.page || 1) - 1) * (this.take || 10);
  }

  get take(): number {
    return this.limit || this.pageSize || 10;
  }
}

export class SortDto {
  @ApiPropertyOptional({ description: '排序字段' })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiPropertyOptional({ description: '排序方式', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsString()
  orderType?: 'ASC' | 'DESC' = 'DESC';
}

export class ListQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: '排序字段' })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiPropertyOptional({ description: '排序方式', enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsString()
  orderType?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;
}

export enum StatusEnum {
  ENABLE = 1,
  DISABLE = 0,
}

export class IdParamDto {
  @ApiPropertyOptional({ description: 'ID' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  id?: number;
}

export class DeleteDto {
  @ApiPropertyOptional({ description: 'ID列表', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];
}

export class StatusUpdateDto {
  @ApiPropertyOptional({ description: '状态', enum: StatusEnum })
  @IsEnum(StatusEnum)
  status: StatusEnum;
}
