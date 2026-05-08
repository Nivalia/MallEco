import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateSettlementRecordDto } from './create-settlement-record.dto';
import { IsString, IsOptional, MaxLength, IsNumber, Min, Max, IsDateString } from 'class-validator';

export class UpdateSettlementRecordDto extends PartialType(CreateSettlementRecordDto) {
  @ApiProperty({ description: '结算单号', example: 'SETT2024010001', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  settlementNumber?: string;

  @ApiProperty({ description: '结算类型: 1-下游结算, 2-上游结算', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(2)
  settlementType?: number;

  @ApiProperty({ description: '渠道ID', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  channelId?: number;

  @ApiProperty({ description: '结算期间(如: 2024-01)', example: '2024-01', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  settlementPeriod?: string;

  @ApiProperty({ description: '结算开始日期', example: '2024-01-01', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @ApiProperty({ description: '结算结束日期', example: '2024-01-31', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ description: '结算保单数量', example: 10, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  totalPolicies?: number;

  @ApiProperty({ description: '总保费', example: 15000, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  totalPremium?: number;

  @ApiProperty({ description: '总佣金', example: 2250, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  totalCommission?: number;

  @ApiProperty({ description: '税额', example: 270, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  taxAmount?: number;

  @ApiProperty({ description: '净额', example: 1980, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  netAmount?: number;

  @ApiProperty({ description: '结算日期', example: '2024-02-10', required: false })
  @IsDateString()
  @IsOptional()
  settlementDate?: Date;

  @ApiProperty({ description: '结算方式', example: '银行转账', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  settlementMethod?: string;

  @ApiProperty({ description: '收款账户', example: '6222021234567890123', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  bankAccount?: string;

  @ApiProperty({ description: '开户行', example: '中国工商银行', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  bankName?: string;

  @ApiProperty({
    description: '结算状态: 1-待确认, 2-已确认, 3-已支付, 4-已取消',
    example: 2,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(4)
  status?: number;

  @ApiProperty({ description: '备注', example: '2024年1月结算', required: false })
  @IsString()
  @IsOptional()
  remarks?: string;
}
