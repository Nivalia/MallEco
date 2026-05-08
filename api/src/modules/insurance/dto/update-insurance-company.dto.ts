import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateInsuranceCompanyDto } from './create-insurance-company.dto';
import { IsString, IsOptional, MinLength, MaxLength, IsNumber, Min, Max } from 'class-validator';

export class UpdateInsuranceCompanyDto extends PartialType(CreateInsuranceCompanyDto) {
  @ApiProperty({ description: '公司代码', example: 'IC001', required: false })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(20)
  companyCode?: string;

  @ApiProperty({ description: '公司名称', example: '中国平安保险有限公司', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  companyName?: string;

  @ApiProperty({ description: '简称', example: '平安保险', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  shortName?: string;

  @ApiProperty({ description: '联系人', example: '张三', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  contactPerson?: string;

  @ApiProperty({ description: '联系电话', example: '13800138000', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  contactPhone?: string;

  @ApiProperty({ description: '地址', example: '北京市朝阳区', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  address?: string;

  @ApiProperty({ description: '合作状态: 1-合作中, 2-暂停, 3-终止', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(3)
  cooperationStatus?: number;

  @ApiProperty({ description: '结算周期(天)', example: 30, required: false })
  @IsNumber()
  @IsOptional()
  @Min(7)
  @Max(90)
  settlementPeriod?: number;

  @ApiProperty({ description: '银行账号', example: '6222021234567890123', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  bankAccount?: string;

  @ApiProperty({ description: '开户行', example: '中国工商银行', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  bankName?: string;

  @ApiProperty({ description: '税号', example: '91110000710936708T', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  taxNumber?: string;

  @ApiProperty({ description: '备注', example: '合作良好', required: false })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiProperty({ description: '排序', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({ description: '状态: 1-启用, 0-禁用', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  status?: number;
}
