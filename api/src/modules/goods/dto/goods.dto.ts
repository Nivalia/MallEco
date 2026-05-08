import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsArray,
  IsDateString,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../shared/dto';

export class CreateGoodsDto {
  @ApiProperty({ description: '商品名称' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  goodsName: string;

  @ApiProperty({ description: '商品编号' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  goodsSn: string;

  @ApiProperty({ description: '商品分类ID' })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({ description: '品牌ID' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ description: '商品重量' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  goodsWeight?: number;

  @ApiPropertyOptional({ description: '市场价格' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  marketPrice?: number;

  @ApiPropertyOptional({ description: '店铺价格' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  shopPrice?: number;

  @ApiPropertyOptional({ description: '商品库存', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ description: '是否上架', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  isOnSale?: number;

  @ApiPropertyOptional({ description: '商品描述' })
  @IsOptional()
  @IsString()
  goodsDesc?: string;

  @ApiPropertyOptional({ description: '商品主图' })
  @IsOptional()
  @IsString()
  goodsImg?: string;

  @ApiPropertyOptional({ description: '商品图片列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goodsGallery?: string[];

  @ApiPropertyOptional({ description: '商品关键词' })
  @IsOptional()
  @IsString()
  keywords?: string;

  @ApiPropertyOptional({ description: '是否新品', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  isNew?: number;

  @ApiPropertyOptional({ description: '是否热销', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  isHot?: number;
}

export class UpdateGoodsDto {
  @ApiPropertyOptional({ description: '商品名称' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  goodsName?: string;

  @ApiPropertyOptional({ description: '商品编号' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  goodsSn?: string;

  @ApiPropertyOptional({ description: '商品分类ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: '品牌ID' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ description: '商品重量' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  goodsWeight?: number;

  @ApiPropertyOptional({ description: '市场价格' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  marketPrice?: number;

  @ApiPropertyOptional({ description: '店铺价格' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  shopPrice?: number;

  @ApiPropertyOptional({ description: '商品库存' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ description: '是否上架' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  isOnSale?: number;

  @ApiPropertyOptional({ description: '商品描述' })
  @IsOptional()
  @IsString()
  goodsDesc?: string;

  @ApiPropertyOptional({ description: '商品主图' })
  @IsOptional()
  @IsString()
  goodsImg?: string;

  @ApiPropertyOptional({ description: '商品图片列表' })
  @IsOptional()
  @IsArray()
  goodsGallery?: string[];

  @ApiPropertyOptional({ description: '商品关键词' })
  @IsOptional()
  @IsString()
  keywords?: string;

  @ApiPropertyOptional({ description: '是否新品' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  isNew?: number;

  @ApiPropertyOptional({ description: '是否热销' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  isHot?: number;
}

export class QueryGoodsDto extends PaginationDto {
  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '商品分类ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: '品牌ID' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ description: '是否上架', enum: [0, 1] })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  isOnSale?: number;

  @ApiPropertyOptional({ description: '是否新品', enum: [0, 1] })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  isNew?: number;

  @ApiPropertyOptional({ description: '是否热销', enum: [0, 1] })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  isHot?: number;

  @ApiPropertyOptional({ description: '排序字段', default: 'createdAt' })
  @IsOptional()
  @IsString()
  orderBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: '排序方式', enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsString()
  orderType?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ description: '最小价格' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({ description: '最大价格' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;
}

export class QuerySkuDto {
  @ApiProperty({ description: '商品ID' })
  @IsString()
  goodsId: string;
}

export class AddCollectionDto {
  @ApiProperty({ description: '商品ID' })
  @IsString()
  goodsId: string;
}

export class AddConsultationDto {
  @ApiProperty({ description: '商品ID' })
  @IsString()
  goodsId: string;

  @ApiProperty({ description: '咨询内容' })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  content: string;
}
