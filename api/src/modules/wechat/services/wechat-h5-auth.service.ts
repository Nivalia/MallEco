import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WechatFans } from '../entities/wechat-fans.entity';
import { WechatOauthUser } from '../entities/wechat-oauth-user.entity';
import { WechatApiService } from './wechat-api.service';
import { BindPhoneDto } from '../dto/bind-phone.dto';
import { ConfigService } from '@nestjs/config';
import { AdvancedCacheService } from '@infrastructure/cache/advanced-cache.service';

@Injectable()
export class WechatH5AuthService {
  constructor(
    @InjectRepository(WechatFans) private readonly fansRepository: Repository<WechatFans>,
    @InjectRepository(WechatOauthUser)
    private readonly oauthUserRepository: Repository<WechatOauthUser>,
    private readonly wechatApiService: WechatApiService,
    private readonly configService: ConfigService,
    private readonly cacheService: AdvancedCacheService,
  ) {}

  private readonly DEFAULT_CACHE_TTL = 1800; // 30分钟
  private readonly CACHE_KEY_PREFIX = 'wechat:h5:auth';

  /**
   * 处理微信授权
   * @param code 授权码
   * @param state 状态参数
   * @param appId 应用ID
   */
  async handleWechatAuth(code: string, state: string, appId: string) {
    if (!code) {
      throw new BadRequestException('缺少code参数');
    }

    try {
      // 获取微信access_token
      const accessTokenResult = await this.wechatApiService.getAccessToken(code, appId);
      const { access_token, openid, unionid } = accessTokenResult;

      // 获取用户信息
      const userInfo = await this.wechatApiService.getUserInfo(access_token, openid);

      // 保存或更新粉丝信息
      let fan = await this.fansRepository.findOne({ where: { openid } });
      if (!fan) {
        fan = this.fansRepository.create({
          openid,
          unionid,
          nickname: userInfo.nickname,
          sex: userInfo.sex,
          city: userInfo.city,
          province: userInfo.province,
          country: userInfo.country,
          headimgurl: userInfo.headimgurl,
          subscribeStatus: 1,
          subscribeTime: new Date(),
        });
        fan = await this.fansRepository.save(fan);
      } else {
        // 更新粉丝信息
        Object.assign(fan, {
          nickname: userInfo.nickname,
          headimgurl: userInfo.headimgurl,
          updateTime: new Date(),
        });
        fan = await this.fansRepository.save(fan);
      }

      // 保存或更新授权用户信息
      let oauthUser = await this.oauthUserRepository.findOne({ where: { openid, appId } });
      if (!oauthUser) {
        oauthUser = this.oauthUserRepository.create({
          openid,
          unionid,
          nickname: userInfo.nickname,
          headimgurl: userInfo.headimgurl,
          appId,
        });
        oauthUser = await this.oauthUserRepository.save(oauthUser);
      }

      // 生成会话token（可选）
      const sessionToken = this.generateSessionToken(openid);

      // 缓存会话信息
      await this.cacheService.set(
        `${this.CACHE_KEY_PREFIX}:session:${sessionToken}`,
        { openid, appId, userId: fan.id },
        this.DEFAULT_CACHE_TTL,
      );

      return {
        success: true,
        message: '微信授权成功',
        data: {
          openid,
          unionid,
          nickname: userInfo.nickname,
          headimgurl: userInfo.headimgurl,
          sessionToken,
          userId: fan.id,
        },
        redirectUrl: state, // 重定向回原页面
      };
    } catch (error) {
      throw new BadRequestException(`微信授权失败: ${error.message}`);
    }
  }

  /**
   * 绑定手机号
   * @param bindPhoneDto 绑定手机号参数
   */
  async bindPhone(bindPhoneDto: BindPhoneDto) {
    const { openid, phoneNumber, verificationCode } = bindPhoneDto;

    // 验证验证码（实际项目中需要实现验证码验证逻辑）
    // await this.verifyVerificationCode(phoneNumber, verificationCode);

    // 查找粉丝
    const fan = await this.fansRepository.findOne({ where: { openid } });
    if (!fan) {
      throw new NotFoundException('用户不存在，请先授权登录');
    }

    // 更新手机号
    fan.phoneNumber = phoneNumber;
    await this.fansRepository.save(fan);

    // 更新授权用户信息
    const oauthUsers = await this.oauthUserRepository.find({ where: { openid } });
    for (const user of oauthUsers) {
      user.phoneNumber = phoneNumber;
      await this.oauthUserRepository.save(user);
    }

    return {
      success: true,
      message: '手机号绑定成功',
      data: {
        openid,
        phoneNumber,
        userId: fan.id,
      },
    };
  }

  /**
   * 获取JS-SDK配置
   * @param url 当前页面URL
   */
  async getJsConfig(url: string) {
    if (!url) {
      throw new BadRequestException('缺少url参数');
    }

    try {
      const jsConfig = await this.wechatApiService.getJsConfig(url);
      return {
        success: true,
        data: jsConfig,
      };
    } catch (error) {
      throw new BadRequestException(`获取JS-SDK配置失败: ${error.message}`);
    }
  }

  /**
   * 根据openid获取用户信息
   * @param openid 用户openid
   */
  async getUserInfoByOpenid(openid: string) {
    const fan = await this.fansRepository.findOne({ where: { openid } });
    if (!fan) {
      throw new NotFoundException('用户不存在');
    }

    return {
      success: true,
      data: {
        openid: fan.openid,
        unionid: fan.unionid,
        nickname: fan.nickname,
        phoneNumber: fan.phoneNumber,
        headimgurl: fan.headimgurl,
        city: fan.city,
        province: fan.province,
        country: fan.country,
        sex: fan.sex,
        subscribeStatus: fan.subscribeStatus,
        subscribeTime: fan.subscribeTime,
      },
    };
  }

  /**
   * 生成会话token
   * @param openid 用户openid
   */
  private generateSessionToken(openid: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `wechat_h5_${openid}_${timestamp}_${random}`;
  }

  /**
   * 验证验证码
   * @param phoneNumber 手机号
   * @param verificationCode 验证码
   */
  private async verifyVerificationCode(phoneNumber: string, verificationCode: string) {
    // 实际项目中需要实现验证码验证逻辑
    // 例如从缓存中获取验证码并验证
    const cacheKey = `${this.CACHE_KEY_PREFIX}:sms:${phoneNumber}`;
    const cachedCode = await this.cacheService.get(cacheKey);
    if (!cachedCode || cachedCode !== verificationCode) {
      throw new BadRequestException('验证码错误');
    }
  }
}
