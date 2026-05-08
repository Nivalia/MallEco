import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { WechatH5AuthService } from '../services/wechat-h5-auth.service';
import { BindPhoneDto } from '../dto/bind-phone.dto';

@ApiTags('公众号管理-H5网页')
@Controller('wechat/h5')
export class WechatH5AuthController {
  constructor(private readonly wechatH5AuthService: WechatH5AuthService) {}

  @Get('auth')
  @ApiOperation({ summary: 'H5页面微信授权' })
  @ApiResponse({ status: 200, description: '微信授权成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 500, description: '服务器错误' })
  async wechatAuth(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('appId') appId: string,
  ) {
    return await this.wechatH5AuthService.handleWechatAuth(code, state, appId);
  }

  @Post('bind-phone')
  @ApiOperation({ summary: '绑定手机号' })
  @ApiResponse({ status: 200, description: '手机号绑定成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async bindPhone(@Body() bindPhoneDto: BindPhoneDto) {
    return await this.wechatH5AuthService.bindPhone(bindPhoneDto);
  }

  @Get('js-config')
  @ApiOperation({ summary: '获取JS-SDK配置' })
  @ApiResponse({ status: 200, description: '获取JS-SDK配置成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  async getJsConfig(@Query('url') url: string) {
    return await this.wechatH5AuthService.getJsConfig(url);
  }

  @Get('user-info')
  @ApiOperation({ summary: '获取授权用户信息' })
  @ApiResponse({ status: 200, description: '获取用户信息成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getUserInfo(@Query('openid') openid: string) {
    return await this.wechatH5AuthService.getUserInfoByOpenid(openid);
  }
}
