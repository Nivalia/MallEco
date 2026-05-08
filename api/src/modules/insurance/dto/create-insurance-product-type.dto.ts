import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, MaxLength, IsNumber, Min, Max } from 'class-validator';

export class CreateInsuranceProductTypeDto {
  @ApiProperty({ description: '类型编码', example: 'commercial' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  typeCode: string;

  @ApiProperty({ description: '类型名称', example: '商业保险' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  typeName: string;

  @ApiProperty({ description: '类型描述', example: '商业保险公司提供的保险产品', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: '排序权重', example: 0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  sortOrder?: number;

  @ApiProperty({ description: '状态: 1-启用, 0-禁用', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  status?: number;
}
