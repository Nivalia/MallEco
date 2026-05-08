import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateInsurancePolicyDto } from './create-insurance-policy.dto';
import { IsString, IsOptional, MaxLength, IsNumber, Min, Max, IsDateString } from 'class-validator';

export class UpdateInsurancePolicyDto extends PartialType(CreateInsurancePolicyDto) {
  @ApiProperty({ description: '保单号', example: 'PAIC20240101000001', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  policyNumber?: string;

  @ApiProperty({ description: '投保人ID', example: '1', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(36)
  policyHolderId?: string;

  @ApiProperty({ description: '保险公司ID', example: '1', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(36)
  insuranceCompanyId?: string;

  @ApiProperty({ description: '保险产品ID', example: '1', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(36)
  insuranceProductId?: string;

  @ApiProperty({ description: '险别', example: '交强险', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  insuranceType?: string;

  @ApiProperty({ description: '渠道ID', example: '1', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(36)
  channelId?: string;

  @ApiProperty({ description: '上游渠道ID', example: '2', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(36)
  upstreamChannelId?: string;

  // 保单基本信息
  @ApiProperty({ description: '生效日期', example: '2024-01-01', required: false })
  @IsDateString()
  @IsOptional()
  effectiveDate?: Date;

  @ApiProperty({ description: '失效日期', example: '2025-01-01', required: false })
  @IsDateString()
  @IsOptional()
  expiryDate?: Date;

  @ApiProperty({ description: '保费', example: 950, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  premium?: number;

  @ApiProperty({ description: '是否含税: 1-是, 0-否', example: 0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  taxIncluded?: number;

  // 下游政策
  @ApiProperty({ description: '下游政策百分比', example: 0.15, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  downstreamPolicyRate?: number;

  @ApiProperty({ description: '下游佣金', example: 142.5, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  downstreamCommission?: number;

  @ApiProperty({ description: '下游净费', example: 807.5, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  downstreamNetFee?: number;

  // 上游政策
  @ApiProperty({ description: '上游政策百分比', example: 0.1, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  upstreamPolicyRate?: number;

  @ApiProperty({ description: '上游佣金', example: 95, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  upstreamCommission?: number;

  // 税额计算
  @ApiProperty({ description: '税额', example: 0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  taxAmount?: number;

  // 业务字段
  @ApiProperty({
    description: '保单状态: 1-生效中, 2-已到期, 3-已退保',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(3)
  policyStatus?: number;

  @ApiProperty({ description: '出单日期', example: '2024-01-01T10:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  issueDate?: Date;

  @ApiProperty({ description: '备注', example: '新车投保', required: false })
  @IsString()
  @IsOptional()
  remarks?: string;

  // 审核状态
  @ApiProperty({ description: '审核状态: 0-未审核, 1-已审核', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  auditStatus?: number;

  @ApiProperty({ description: '审核备注', example: '审核通过', required: false })
  @IsString()
  @IsOptional()
  auditRemark?: string;
}
