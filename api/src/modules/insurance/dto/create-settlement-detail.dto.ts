import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateSettlementDetailDto {
  @ApiProperty({ description: '结算记录ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  settlementId: number;

  @ApiProperty({ description: '保单ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  policyId: number;

  @ApiProperty({ description: '保费', example: 950 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  premium: number;

  @ApiProperty({ description: '佣金率', example: 0.15 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  commissionRate: number;

  @ApiProperty({ description: '佣金金额', example: 142.5 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  commissionAmount: number;

  @ApiProperty({ description: '是否含税', example: 0, required: false })
  @IsNumber()
  @IsOptional()
  taxIncluded?: number;

  @ApiProperty({ description: '税额', example: 17.1, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  taxAmount?: number;

  @ApiProperty({ description: '净额', example: 125.4 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  netAmount: number;
}
