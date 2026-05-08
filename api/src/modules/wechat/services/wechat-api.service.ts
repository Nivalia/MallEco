import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError } from 'rxjs';
import * as crypto from 'crypto';
import { AdvancedCacheService } from '@infrastructure/cache/advanced-cache.service';

@Injectable()
export class WechatApiService {
  private readonly cacheKeyPrefix = 'wechat:api';
  private readonly defaultCacheTtl = 7000; // 116分钟，小于7200秒

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly cacheService: AdvancedCacheService,
  ) {}

  /**
   * 获取微信公众号的全局access_token
   */
  async getGlobalAccessToken(appId?: string, appSecret?: string): Promise<string> {
    const targetAppId = appId || this.configService.get('WECHAT_APP_ID');
    const targetAppSecret = appSecret || this.configService.get('WECHAT_APP_SECRET');

    if (!targetAppId || !targetAppSecret) {
      throw new BadRequestException('微信公众号配置缺失');
    }

    const cacheKey = `${this.cacheKeyPrefix}:access_token:${targetAppId}`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${targetAppId}&secret=${targetAppSecret}`;

        try {
          const response = await firstValueFrom(
            this.httpService.get(url).pipe(
              catchError(error => {
                throw new HttpException(
                  `获取全局access_token失败: ${error.message}`,
                  HttpStatus.INTERNAL_SERVER_ERROR,
                );
              }),
            ),
          );

          const { access_token, expires_in } = response.data;
          if (!access_token) {
            throw new BadRequestException('获取全局access_token失败');
          }

          // 缓存时间比实际过期时间少200秒，确保有足够时间刷新
          const cacheTime = Math.min(expires_in - 200, this.defaultCacheTtl);
          await this.cacheService.set(cacheKey, access_token, cacheTime);

          return access_token;
        } catch (error) {
          throw new HttpException(
            `获取全局access_token失败: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      },
      this.defaultCacheTtl,
    );
  }

  /**
   * 通过code获取微信用户的access_token和openid
   */
  async getAccessToken(code: string, appId?: string, appSecret?: string): Promise<any> {
    const targetAppId = appId || this.configService.get('WECHAT_APP_ID');
    const targetAppSecret = appSecret || this.configService.get('WECHAT_APP_SECRET');

    if (!targetAppId || !targetAppSecret) {
      throw new BadRequestException('微信公众号配置缺失');
    }

    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${targetAppId}&secret=${targetAppSecret}&code=${code}&grant_type=authorization_code`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url).pipe(
          catchError(error => {
            throw new HttpException(
              `获取用户access_token失败: ${error.message}`,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );

      const data = response.data;
      if (data.errcode) {
        throw new BadRequestException(`获取用户access_token失败: ${data.errmsg}`);
      }

      return data;
    } catch (error) {
      throw new HttpException(
        `获取用户access_token失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取微信用户信息
   */
  async getUserInfo(accessToken: string, openid: string): Promise<any> {
    const url = `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}&lang=zh_CN`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url).pipe(
          catchError(error => {
            throw new HttpException(
              `获取用户信息失败: ${error.message}`,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );

      const data = response.data;
      if (data.errcode) {
        throw new BadRequestException(`获取用户信息失败: ${data.errmsg}`);
      }

      return data;
    } catch (error) {
      throw new HttpException(
        `获取用户信息失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取JS-SDK配置
   */
  async getJsConfig(url: string): Promise<any> {
    const accessToken = await this.getGlobalAccessToken();
    const ticket = await this.getJsApiTicket(accessToken);
    const nonceStr = this.generateNonceStr();
    const timestamp = Math.floor(Date.now() / 1000);

    // 生成签名
    const signature = this.generateSignature(ticket, nonceStr, timestamp, url);

    return {
      appId: this.configService.get('WECHAT_APP_ID'),
      timestamp,
      nonceStr,
      signature,
      jsApiList: [
        'updateAppMessageShareData',
        'updateTimelineShareData',
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'chooseImage',
        'previewImage',
        'uploadImage',
        'downloadImage',
        'getLocation',
        'openLocation',
        'scanQRCode',
        'chooseWXPay',
      ],
    };
  }

  /**
   * 获取JS-SDK ticket
   */
  private async getJsApiTicket(accessToken: string): Promise<string> {
    const cacheKey = `${this.cacheKeyPrefix}:jsapi_ticket`;

    return await this.cacheService.readThrough(
      cacheKey,
      async () => {
        const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`;

        try {
          const response = await firstValueFrom(
            this.httpService.get(url).pipe(
              catchError(error => {
                throw new HttpException(
                  `获取JS-SDK ticket失败: ${error.message}`,
                  HttpStatus.INTERNAL_SERVER_ERROR,
                );
              }),
            ),
          );

          const { ticket, expires_in } = response.data;
          if (!ticket) {
            throw new BadRequestException('获取JS-SDK ticket失败');
          }

          // 缓存时间比实际过期时间少200秒
          const cacheTime = Math.min(expires_in - 200, this.defaultCacheTtl);
          await this.cacheService.set(cacheKey, ticket, cacheTime);

          return ticket;
        } catch (error) {
          throw new HttpException(
            `获取JS-SDK ticket失败: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      },
      this.defaultCacheTtl,
    );
  }

  /**
   * 生成JS-SDK签名
   */
  private generateSignature(
    ticket: string,
    nonceStr: string,
    timestamp: number,
    url: string,
  ): string {
    const params = {
      jsapi_ticket: ticket,
      noncestr: nonceStr,
      timestamp,
      url,
    };

    // 按字典序排序
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    // 生成sha1签名
    const signature = crypto.createHash('sha1').update(sortedParams).digest('hex');
    return signature;
  }

  /**
   * 生成随机字符串
   */
  private generateNonceStr(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 发送模板消息
   */
  async sendTemplateMessage(
    templateId: string,
    openid: string,
    data: any,
    url?: string,
  ): Promise<any> {
    const accessToken = await this.getGlobalAccessToken();
    const apiUrl = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${accessToken}`;

    const message = {
      touser: openid,
      template_id: templateId,
      url,
      data,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(apiUrl, message).pipe(
          catchError(error => {
            throw new HttpException(
              `发送模板消息失败: ${error.message}`,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );

      const result = response.data;
      if (result.errcode !== 0) {
        throw new BadRequestException(`发送模板消息失败: ${result.errmsg}`);
      }

      return result;
    } catch (error) {
      throw new HttpException(
        `发送模板消息失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 批量发送模板消息
   */
  async batchSendTemplateMessage(
    templateId: string,
    openids: string[],
    data: any,
    url?: string,
  ): Promise<any> {
    const results = [];

    for (const openid of openids) {
      try {
        const result = await this.sendTemplateMessage(templateId, openid, data, url);
        results.push({ openid, success: true, messageId: result.msgid });
      } catch (error) {
        results.push({ openid, success: false, error: error.message });
      }
    }

    return {
      total: openids.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      details: results,
    };
  }

  /**
   * 创建自定义菜单
   */
  async createMenu(menu: any): Promise<any> {
    const accessToken = await this.getGlobalAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${accessToken}`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, menu).pipe(
          catchError(error => {
            throw new HttpException(
              `创建菜单失败: ${error.message}`,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );

      const result = response.data;
      if (result.errcode !== 0) {
        throw new BadRequestException(`创建菜单失败: ${result.errmsg}`);
      }

      return result;
    } catch (error) {
      throw new HttpException(`创建菜单失败: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 获取自定义菜单
   */
  async getMenu(): Promise<any> {
    const accessToken = await this.getGlobalAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/menu/get?access_token=${accessToken}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url).pipe(
          catchError(error => {
            throw new HttpException(
              `获取菜单失败: ${error.message}`,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(`获取菜单失败: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 删除自定义菜单
   */
  async deleteMenu(): Promise<any> {
    const accessToken = await this.getGlobalAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=${accessToken}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url).pipe(
          catchError(error => {
            throw new HttpException(
              `删除菜单失败: ${error.message}`,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );

      const result = response.data;
      if (result.errcode !== 0) {
        throw new BadRequestException(`删除菜单失败: ${result.errmsg}`);
      }

      return result;
    } catch (error) {
      throw new HttpException(`删除菜单失败: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
