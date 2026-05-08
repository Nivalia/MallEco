import { IsString, IsDate, IsDecimal, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateClaimRecordDto {
  @IsString({ message: '理赔单号必须是字符串' })
  @IsOptional()
  claimNumber?: string;

  @IsString({ message: '保单ID必须是字符串' })
  @IsOptional()
  policyId?: string;

  @IsString({ message: '保险公司ID必须是字符串' })
  @IsOptional()
  insuranceCompanyId?: string;

  @IsString({ message: '投保人ID必须是字符串' })
  @IsOptional()
  policyHolderId?: string;

  @IsDate({ message: '出险日期必须是日期' })
  @Type(() => Date)
  @IsOptional()
  claimDate?: Date;

  @IsDate({ message: '报案日期必须是日期' })
  @Type(() => Date)
  @IsOptional()
  reportDate?: Date;

  @IsDecimal({ decimal_digits: '0,2' }, { message: '理赔金额必须是数字' })
  @IsOptional()
  claimAmount?: number;

  @IsString({ message: '理赔类型必须是字符串' })
  @IsOptional()
  claimType?: string;

  @IsString({ message: '理赔原因必须是字符串' })
  @IsOptional()
  claimReason?: string;

  @IsString({ message: '事故地点必须是字符串' })
  @IsOptional()
  accidentLocation?: string;

  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: '理赔状态必须是数字' })
  @IsOptional()
  claimStatus?: number;

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

  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: '处理时长必须是数字' })
  @IsOptional()
  processingTime?: number;

  @IsString({ message: '所需材料必须是字符串' })
  @IsOptional()
  requiredDocuments?: string;

  @IsString({ message: '已提交材料必须是字符串' })
  @IsOptional()
  submittedDocuments?: string;

  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: '材料状态必须是数字' })
  @IsOptional()
  documentStatus?: number;

  @IsDecimal({ decimal_digits: '0,2' }, { message: '实际赔付金额必须是数字' })
  @IsOptional()
  paymentAmount?: number;

  @IsDate({ message: '赔付日期必须是日期' })
  @Type(() => Date)
  @IsOptional()
  paymentDate?: Date;

  @IsString({ message: '赔付方式必须是字符串' })
  @IsOptional()
  paymentMethod?: string;

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
