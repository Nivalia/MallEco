import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, MaxLength, IsNumber, Min, Max } from 'class-validator';

export class CreatePolicyHolderDto {
  @ApiProperty({ description: '类型: 1-公司, 2-个人', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(2)
  holderType: number;

  @ApiProperty({ description: '公司名称', example: '北京科技有限公司', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  companyName?: string;

  @ApiProperty({ description: '车牌号', example: '京A12345', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  licensePlate?: string;

  @ApiProperty({ description: '个人姓名', example: '李四', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  holderName?: string;

  @ApiProperty({ description: '联系人', example: '王五', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  contactPerson?: string;

  @ApiProperty({ description: '联系电话', example: '13900139000' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  phone: string;

  @ApiProperty({ description: '邮箱', example: 'contact@example.com', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @ApiProperty({ description: '纳税人识别号', example: '91110105MA01234567', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  taxNumber?: string;

  @ApiProperty({ description: '地址', example: '北京市海淀区', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @ApiProperty({ description: '银行账号', example: '6222021234567890123', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  bankAccount?: string;

  @ApiProperty({ description: '开户行', example: '中国建设银行', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  bankName?: string;

  @ApiProperty({ description: '状态: 1-正常, 0-停用', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  status?: number;
}
