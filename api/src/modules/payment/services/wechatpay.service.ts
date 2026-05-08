import { Injectable, Logger } from '@nestjs/common';
import { PaymentRecord } from '../entities/payment-record.entity';
import { QueryPaymentDto } from '../dto/query-payment.dto';
import { PaymentCallbackDto } from '../dto/payment-callback.dto';
import * as fs from 'fs';
import * as path from 'path';
import Wechatpay from 'wechatpay-node-v3';

// 直接使用库提供的类型
type WechatPayInstance = Wechatpay;

@Injectable()
export class WechatPayService {
  private readonly logger = new Logger(WechatPayService.name);
  private readonly wechatpay: WechatPayInstance | null = null;

  constructor() {
    try {
      // 读取证书文件
      const privateKey = fs.readFileSync(
        path.join(process.cwd(), 'config', 'wechatpay', 'private_key.pem'),
      );
      const certificate = fs.readFileSync(
        path.join(process.cwd(), 'config', 'wechatpay', 'cert.pem'),
      );

      // 初始化微信支付SDK
      this.wechatpay = new Wechatpay({
        appid: process.env.WECHAT_APPID,
        mchid: process.env.WECHAT_MCHID,
        publicKey: certificate,
        privateKey,
      });
    } catch (error) {
      this.logger.warn(
        '微信支付证书文件不存在或无法读取，微信支付功能将不可用:',
        error instanceof Error ? error.message : String(error),
      );
      this.wechatpay = null;
    }
  }

  async createPayment(
    paymentRecord: PaymentRecord,
    paymentClient: string,
    queryPaymentDto: QueryPaymentDto,
  ) {
    if (!this.wechatpay) {
      throw new Error('微信支付未初始化');
    }

    try {
      const notifyUrl =
        process.env.WECHAT_NOTIFY_URL || 'https://example.com/payment/callback/wechatpay';

      // 构建支付参数
      const params = {
        description: paymentRecord.subject,
        out_trade_no: paymentRecord.outTradeNo,
        notify_url: notifyUrl,
        amount: {
          total: Math.round(paymentRecord.amount * 100), // 微信支付金额单位为分
          currency: 'CNY',
        },
      };

      let result;

      // 根据客户端类型调用不同的支付接口
      switch (paymentClient) {
        case 'pc':
          // JSAPI支付
          if (!queryPaymentDto.openId) {
            throw new Error('JSAPI支付需要用户openId');
          }
          result = await this.wechatpay.transactions_jsapi({
            ...params,
            payer: {
              openid: queryPaymentDto.openId,
            },
          });
          break;
        case 'h5':
          // H5支付
          result = await this.wechatpay.transactions_h5({
            ...params,
            scene_info: {
              payer_client_ip: '127.0.0.1',
              h5_info: {
                type: 'Wap',
                app_name: 'MallEco',
                app_url: 'https://example.com',
              },
            },
          });
          break;
        case 'app':
          // APP支付
          result = await this.wechatpay.transactions_app(params);
          break;
        case 'mini_program':
          // 小程序支付
          if (!queryPaymentDto.openId) {
            throw new Error('小程序支付需要用户openId');
          }
          result = await this.wechatpay.transactions_jsapi({
            ...params,
            payer: {
              openid: queryPaymentDto.openId,
            },
          });
          break;
        default:
          throw new Error('不支持的支付客户端类型');
      }

      return result;
    } catch (error) {
      this.logger.error('创建微信支付订单失败:', error);
      throw error;
    }
  }

  async handleCallback(callbackData: PaymentCallbackDto) {
    if (!this.wechatpay) {
      throw new Error('微信支付未初始化');
    }

    try {
      // 验证回调签名
      const { signature, timestamp, nonce, body, serial } = callbackData;
      const verifyResult = await this.wechatpay.verifySign({
        signature: String(signature || ''),
        timestamp: String(timestamp || ''),
        nonce: String(nonce || ''),
        body: String(body || ''),
        serial: String(serial || ''),
      });

      if (!verifyResult) {
        this.logger.error('微信支付回调签名验证失败:', callbackData);
        return {
          success: false,
          message: '签名验证失败',
        };
      }

      // 解析回调数据
      const data = JSON.parse(body);
      const { out_trade_no, transaction_id, amount, success_time } = data;

      return {
        success: true,
        outTradeNo: out_trade_no,
        tradeNo: transaction_id,
        amount: amount.total / 100, // 微信支付金额单位为分
        payTime: new Date(success_time),
      };
    } catch (error) {
      this.logger.error('处理微信支付回调失败:', error);
      throw error;
    }
  }

  async queryPayment(outTradeNo: string) {
    if (!this.wechatpay) {
      throw new Error('微信支付未初始化');
    }

    try {
      const result = await this.wechatpay.query({ out_trade_no: String(outTradeNo) });
      return result;
    } catch (error) {
      this.logger.error('查询微信支付结果失败:', error);
      throw error;
    }
  }

  async closePayment(outTradeNo: string) {
    if (!this.wechatpay) {
      throw new Error('微信支付未初始化');
    }

    try {
      const result = await this.wechatpay.close(outTradeNo);

      return {
        success: true,
      };
    } catch (error) {
      this.logger.error('关闭微信支付订单失败:', error);
      throw error;
    }
  }

  async refund(params: {
    outTradeNo: string;
    refundNo: string;
    refundAmount: number;
    refundReason: string;
  }) {
    if (!this.wechatpay) {
      throw new Error('微信支付未初始化');
    }

    try {
      const result = await this.wechatpay.refunds({
        out_trade_no: params.outTradeNo,
        out_refund_no: params.refundNo,
        amount: {
          refund: Math.round(params.refundAmount * 100), // 微信支付金额单位为分
          total: Math.round(params.refundAmount * 100), // 这里应该使用实际支付金额，简化处理
          currency: 'CNY',
        },
        reason: params.refundReason,
      });

      return {
        success: true,
        refundNo: params.refundNo,
      };
    } catch (error) {
      this.logger.error('微信支付退款失败:', error);
      throw error;
    }
  }
}
