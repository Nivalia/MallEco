import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  IsBoolean,
} from 'class-validator';

export class CreateInsuranceProductDto {
  @ApiProperty({ description: '产品代码', example: 'IP001' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  productCode: string;

  @ApiProperty({ description: '产品名称', example: '机动车交通事故责任强制保险' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  productName: string;

  @ApiProperty({ description: '险别类型', example: '交强险' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  insuranceType: string;

  @ApiProperty({ description: '产品描述', example: '机动车交通事故责任强制保险', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '保险公司ID', example: '1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(36)
  companyId: string;

  @ApiProperty({ description: '最低保费', example: 950, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minPremium?: number;

  @ApiProperty({ description: '最高保费', example: 15000, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxPremium?: number;

  @ApiProperty({ description: '佣金率范围', example: '0.10-0.15', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  commissionRange?: string;

  @ApiProperty({ description: '状态: 1-启用, 0-禁用', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  status?: number;

  @ApiProperty({ description: '排序', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  // 新增字段，与前端保持一致
  @ApiProperty({ description: '保费', example: 1000, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @ApiProperty({ description: '上游政策', example: 10, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  upstreamPolicy?: number;

  @ApiProperty({ description: '上游佣金', example: 100, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  upstreamCommission?: number;

  @ApiProperty({ description: '下游政策', example: 5, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  downstreamPolicy?: number;

  @ApiProperty({ description: '下游佣金', example: 50, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  downstreamCommission?: number;

  @ApiProperty({ description: '是否扣税', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  taxDeductible?: boolean;
}
