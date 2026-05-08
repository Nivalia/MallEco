import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../shared/dto';

/**
 * 取消订单DTO
 */
export class CancelOrderDto {
  @ApiPropertyOptional({ description: '取消原因' })
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * 修改订单价格DTO
 */
export class ModifyOrderPriceDto {
  @ApiProperty({ description: '新价格', example: 99.99 })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ description: '价格说明' })
  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 修改订单备注DTO
 */
export class ModifyOrderRemarkDto {
  @ApiProperty({ description: '备注', example: '客户要求提前发货' })
  @IsString()
  remark: string;
}

/**
 * 订单发货DTO
 */
export class OrderDeliveryDto {
  @ApiProperty({ description: '物流公司编码', example: 'SF' })
  @IsString()
  deliveryCompany: string;

  @ApiProperty({ description: '物流单号', example: 'SF1234567890' })
  @IsString()
  deliverySn: string;

  @ApiPropertyOptional({ description: '发货备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 售后审核DTO
 */
export class AfterSaleReviewDto {
  @ApiProperty({ description: '审核结果：pass-通过，reject-拒绝', enum: ['pass', 'reject'] })
  @IsEnum(['pass', 'reject'])
  result: 'pass' | 'reject';

  @ApiPropertyOptional({ description: '审核备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 售后确认收货DTO
 */
export class AfterSaleConfirmDto {
  @ApiPropertyOptional({ description: '确认备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 售后发货DTO（退货退款）
 */
export class AfterSaleDeliveryDto {
  @ApiProperty({ description: '物流公司编码', example: 'SF' })
  @IsString()
  deliveryCompany: string;

  @ApiProperty({ description: '物流单号', example: 'SF1234567890' })
  @IsString()
  deliverySn: string;

  @ApiPropertyOptional({ description: '发货备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 物流查询DTO
 */
export class TracesQueryDto {
  @ApiPropertyOptional({ description: '物流公司编码' })
  @IsOptional()
  @IsString()
  deliveryCompany?: string;
}

/**
 * 发票查询DTO
 */
export class ReceiptQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: '订单编号' })
  @IsOptional()
  @IsString()
  orderSn?: string;

  @ApiPropertyOptional({ description: '发票状态：0-未开，1-已开，2-作废' })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiPropertyOptional({ description: '开始时间' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsOptional()
  @IsString()
  endTime?: string;
}

/**
 * 订单统计查询DTO
 */
export class OrderNumQueryDto {
  @ApiPropertyOptional({ description: '店铺ID' })
  @IsOptional()
  @IsString()
  storeId?: string;

  @ApiPropertyOptional({ description: '开始时间' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsOptional()
  @IsString()
  endTime?: string;
}

/**
 * 批量发货DTO
 */
export class BatchDeliverDto {
  @ApiProperty({ description: '发货数据列表', type: [OrderDeliveryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderDeliveryDto)
  deliveries: OrderDeliveryDto[];
}
