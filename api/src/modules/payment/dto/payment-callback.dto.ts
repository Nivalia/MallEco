import { IsOptional, IsString, IsNumber } from 'class-validator';

export class PaymentCallbackDto {
  @IsOptional()
  @IsString()
  tradeNo?: string;

  @IsOptional()
  @IsString()
  outTradeNo?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  totalAmount?: number;

  @IsOptional()
  @IsString()
  tradeStatus?: string;

  @IsOptional()
  @IsString()
  paymentTime?: string;

  @IsOptional()
  @IsString()
  sign?: string;

  @IsOptional()
  @IsString()
  signType?: string;

  @IsOptional()
  @IsString()
  gmtPayment?: string;

  // 支付宝额外字段
  @IsOptional()
  @IsString()
  authAppId?: string;

  @IsOptional()
  @IsString()
  buyerLogonId?: string;

  @IsOptional()
  @IsString()
  buyerPayAmount?: string;

  @IsOptional()
  @IsString()
  invoiceAmount?: string;

  @IsOptional()
  @IsString()
  pointAmount?: string;

  @IsOptional()
  @IsString()
  receiptAmount?: string;

  // 微信额外字段
  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  timeEnd?: string;

  @IsOptional()
  @IsString()
  returnCode?: string;

  @IsOptional()
  @IsString()
  returnMsg?: string;

  // 微信回调体
  @IsOptional()
  @IsString()
  body?: string;

  // 微信回调序列号
  @IsOptional()
  @IsString()
  serial?: string;

  [key: string]: string | number | undefined;
}
