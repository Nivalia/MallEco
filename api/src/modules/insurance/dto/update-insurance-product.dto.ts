import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateInsuranceProductDto } from './create-insurance-product.dto';
import { IsString, IsOptional, MinLength, MaxLength, IsNumber, Min } from 'class-validator';

export class UpdateInsuranceProductDto extends PartialType(CreateInsuranceProductDto) {
  @ApiProperty({ description: '产品代码', example: 'IP001', required: false })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  productCode?: string;

  @ApiProperty({ description: '产品名称', example: '机动车交通事故责任强制保险', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  productName?: string;

  @ApiProperty({ description: '险别类型', example: '交强险', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  insuranceType?: string;

  @ApiProperty({ description: '产品描述', example: '机动车交通事故责任强制保险', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '保险公司ID', example: '1', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(36)
  companyId?: string;

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
}
