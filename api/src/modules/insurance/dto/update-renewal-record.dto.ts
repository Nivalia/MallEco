import { IsString, IsDate, IsDecimal, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRenewalRecordDto {
  @IsString({ message: '续保单号必须是字符串' })
  @IsOptional()
  renewalNumber?: string;

  @IsString({ message: '续保后保单ID必须是字符串' })
  @IsOptional()
  policyId?: string;

  @IsString({ message: '原保单ID必须是字符串' })
  @IsOptional()
  originalPolicyId?: string;

  @IsString({ message: '保险公司ID必须是字符串' })
  @IsOptional()
  insuranceCompanyId?: string;

  @IsString({ message: '投保人ID必须是字符串' })
  @IsOptional()
  policyHolderId?: string;

  @IsString({ message: '保险产品ID必须是字符串' })
  @IsOptional()
  insuranceProductId?: string;

  @IsDate({ message: '续保日期必须是日期' })
  @Type(() => Date)
  @IsOptional()
  renewalDate?: Date;

  @IsDate({ message: '续保生效日期必须是日期' })
  @Type(() => Date)
  @IsOptional()
  effectiveDate?: Date;

  @IsDate({ message: '续保失效日期必须是日期' })
  @Type(() => Date)
  @IsOptional()
  expiryDate?: Date;

  @IsDecimal({ decimal_digits: '0,2' }, { message: '续保费必须是数字' })
  @IsOptional()
  premium?: number;

  @IsDecimal({ decimal_digits: '0,2' }, { message: '原保费必须是数字' })
  @IsOptional()
  originalPremium?: number;

  @IsDecimal({ decimal_digits: '0,2' }, { message: '保费变化必须是数字' })
  @IsOptional()
  premiumChange?: number;

  @IsString({ message: '变化原因必须是字符串' })
  @IsOptional()
  changeReason?: string;

  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: '续保状态必须是数字' })
  @IsOptional()
  renewalStatus?: number;

  @IsString({ message: '状态描述必须是字符串' })
  @IsOptional()
  statusDescription?: string;

  @IsString({ message: '处理人ID必须是字符串' })
  @IsOptional()
  handlerId?: string;

  @IsString({ message: '处理人姓名必须是字符串' })
  @IsOptional()
  handlerName?: string;

  @IsDate({ message: '处理开始日期必须是日期' })
  @Type(() => Date)
  @IsOptional()
  processStartDate?: Date;

  @IsDate({ message: '处理结束日期必须是日期' })
  @Type(() => Date)
  @IsOptional()
  processEndDate?: Date;

  @IsDate({ message: '提醒日期必须是日期' })
  @Type(() => Date)
  @IsOptional()
  reminderDate?: Date;

  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: '提醒次数必须是数字' })
  @IsOptional()
  reminderCount?: number;

  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: '是否自动续保必须是数字' })
  @IsOptional()
  isAutoRenewal?: number;

  @IsString({ message: '备注必须是字符串' })
  @IsOptional()
  remarks?: string;

  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: '审核状态必须是数字' })
  @IsOptional()
  auditStatus?: number;

  @IsString({ message: '审核人必须是字符串' })
  @IsOptional()
  auditBy?: string;

  @IsDate({ message: '审核时间必须是日期' })
  @Type(() => Date)
  @IsOptional()
  auditAt?: Date;

  @IsString({ message: '审核备注必须是字符串' })
  @IsOptional()
  auditRemark?: string;
}
