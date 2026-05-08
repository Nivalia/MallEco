import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../shared/dto';

export enum OrderStatus {
  PENDING_PAYMENT = 0,
  PENDING_SHIPMENT = 1,
  PENDING_RECEIVE = 2,
  PENDING_EVALUATE = 3,
  COMPLETED = 4,
  CANCELLED = 5,
}

export enum PayType {
  ALIPAY = 1,
  WECHAT = 2,
}

export class QueryOrderDto extends PaginationDto {
  @ApiPropertyOptional({ description: '用户ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: '订单状态', enum: OrderStatus })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number;

  @ApiPropertyOptional({ description: '支付方式', enum: PayType })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  payType?: number;

  @ApiPropertyOptional({ description: '订单编号' })
  @IsOptional()
  @IsString()
  orderSn?: string;

  @ApiPropertyOptional({ description: '收货人手机号' })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional({ description: '排序字段', default: 'createdAt' })
  @IsOptional()
  @IsString()
  orderBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: '排序方式', enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsString()
  orderType?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ description: '开始时间' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsOptional()
  @IsString()
  endTime?: string;
}
