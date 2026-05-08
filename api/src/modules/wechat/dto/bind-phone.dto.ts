import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class BindPhoneDto {
  @IsNotEmpty({ message: 'openid不能为空' })
  @IsString({ message: 'openid必须是字符串' })
  openid: string;

  @IsNotEmpty({ message: '手机号不能为空' })
  @IsPhoneNumber('CN', { message: '手机号格式不正确' })
  phoneNumber: string;

  @IsNotEmpty({ message: '验证码不能为空' })
  @IsString({ message: '验证码必须是字符串' })
  verificationCode: string;
}
