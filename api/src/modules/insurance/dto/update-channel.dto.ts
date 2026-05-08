import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateChannelDto } from './create-channel.dto';
import { IsString, IsOptional, MinLength, MaxLength, IsNumber, Min, Max } from 'class-validator';

export class UpdateChannelDto extends PartialType(CreateChannelDto) {
  @ApiProperty({ description: '类型: 1-渠道, 2-业务员', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(2)
  channelType?: number;

  @ApiProperty({ description: '渠道编码', example: 'CH001', required: false })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  channelCode?: string;

  @ApiProperty({ description: '渠道名称/业务员姓名', example: '北京销售渠道', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  channelName?: string;

  @ApiProperty({ description: '上级渠道ID', example: '0', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(36)
  parentId?: string;

  @ApiProperty({ description: '联系人', example: '赵六', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  contactPerson?: string;

  @ApiProperty({ description: '联系电话', example: '13700137000', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  contactPhone?: string;

  @ApiProperty({ description: '邮箱', example: 'channel@example.com', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @ApiProperty({ description: '身份证号(业务员)', example: '110101199001011234', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  idCard?: string;

  @ApiProperty({ description: '银行账号', example: '6222021234567890123', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  bankAccount?: string;

  @ApiProperty({ description: '开户行', example: '中国农业银行', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  bankName?: string;

  @ApiProperty({ description: '默认政策率', example: 0.1, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  defaultRate?: number;

  @ApiProperty({ description: '默认是否含税', example: 0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  taxIncludedDefault?: number;

  @ApiProperty({ description: '结算方式', example: 'monthly', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  settlementMethod?: string;

  @ApiProperty({ description: '地址', example: '北京市丰台区', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  address?: string;

  @ApiProperty({ description: '状态: 1-正常, 0-停用', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  status?: number;
}
