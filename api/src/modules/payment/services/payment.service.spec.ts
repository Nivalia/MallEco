import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { PaymentService } from './payment.service';
import { PaymentRecord } from '../entities/payment-record.entity';
import { AlipayService } from './alipay.service';
import { WechatPayService } from './wechatpay.service';
import { GoodsService } from '../../goods/goods.service';
import { OrdersService } from '../../orders/orders.service';
import { QueryPaymentDto } from '../dto/query-payment.dto';
import { PaymentCallbackDto } from '../dto/payment-callback.dto';
import { PaymentClient } from '../dto/create-payment.dto';

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let paymentRecordRepository: jest.Mocked<Repository<PaymentRecord>>;
  let alipayService: jest.Mocked<AlipayService>;
  let wechatPayService: jest.Mocked<WechatPayService>;
  let goodsService: jest.Mocked<GoodsService>;
  let ordersService: jest.Mocked<OrdersService>;

  const mockPaymentRecord: PaymentRecord = {
    id: '1',
    orderId: '1',
    orderSn: 'ORDER123',
    outTradeNo: 'TEST202401010001',
    amount: 80,
    currency: 'CNY',
    status: 0,
    paymentMethodCode: 'alipay',
    paymentMethodName: '支付宝',
    tradeNo: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as PaymentRecord;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: getRepositoryToken(PaymentRecord),
          useValue: {
            findOne: jest.fn() as (
              this: void,
              ...args: any[]
            ) => Promise<PaymentRecord | undefined>,
            create: jest.fn() as (this: void, ...args: any[]) => PaymentRecord,
            save: jest.fn() as (this: void, ...args: any[]) => Promise<PaymentRecord>,
            update: jest.fn() as (this: void, ...args: any[]) => Promise<any>,
          },
        },
        {
          provide: AlipayService,
          useValue: {
            createPayment: jest.fn() as (this: void, ...args: any[]) => Promise<any>,
            handleCallback: jest.fn() as (this: void, ...args: any[]) => Promise<any>,
            refund: jest.fn() as (this: void, ...args: any[]) => Promise<any>,
          },
        },
        {
          provide: WechatPayService,
          useValue: {
            createPayment: jest.fn() as (this: void, ...args: any[]) => Promise<any>,
            handleCallback: jest.fn() as (this: void, ...args: any[]) => Promise<any>,
            refund: jest.fn() as (this: void, ...args: any[]) => Promise<any>,
          },
        },
        {
          provide: GoodsService,
          useValue: {
            deductGoodsStock: jest.fn() as (this: void, ...args: any[]) => Promise<void>,
          },
        },
        {
          provide: OrdersService,
          useValue: {
            updateOrderStatus: jest.fn() as (this: void, ...args: any[]) => Promise<void>,
            getOrderWithItemsById: jest.fn() as (this: void, ...args: any[]) => Promise<any>,
          },
        },
      ],
    }).compile();

    paymentService = module.get<PaymentService>(PaymentService);
    paymentRecordRepository = module.get(getRepositoryToken(PaymentRecord));
    alipayService = module.get(AlipayService);
    wechatPayService = module.get(WechatPayService);
    goodsService = module.get(GoodsService);
    ordersService = module.get(OrdersService);
  });

  describe('createPayment', () => {
    it('应该成功创建支付记录', async () => {
      // Arrange
      const createPaymentDto = {
        orderId: '1',
        paymentMethod: 'alipay',
        amount: 80,
        subject: '测试商品订单',
        body: '测试商品订单描述',
        paymentClient: PaymentClient.PC,
        returnUrl: 'http://example.com/return',
      };

      paymentRecordRepository.create.mockReturnValue(mockPaymentRecord);
      paymentRecordRepository.save.mockResolvedValue(mockPaymentRecord);

      // Act
      const result = await paymentService.createPayment(createPaymentDto);

      // Assert
      expect(result).toHaveProperty('outTradeNo');
      expect(result).toHaveProperty('paymentRecordId');
      expect(paymentRecordRepository.create).toHaveBeenCalled();
      expect(paymentRecordRepository.save).toHaveBeenCalledWith(mockPaymentRecord);
    });
  });

  describe('paymentCallback', () => {
    it('应该成功处理支付宝回调', async () => {
      // Arrange
      const paymentMethod = 'alipay';
      const callbackDto: PaymentCallbackDto = {
        signature: 'test-signature',
        timestamp: '1234567890',
        nonce: 'test-nonce',
        body: JSON.stringify({
          out_trade_no: 'TEST202401010001',
          trade_no: '2024010100000001',
          total_amount: '80.00',
          gmt_payment: '2024-01-01 12:00:00',
        }),
        serial: 'test-serial',
      };

      paymentRecordRepository.findOne.mockResolvedValue(mockPaymentRecord);
      alipayService.handleCallback.mockResolvedValue({
        success: true,
        outTradeNo: 'TEST202401010001',
        tradeNo: '2024010100000001',
        amount: 80,
        payTime: new Date('2024-01-01 12:00:00'),
      });
      paymentRecordRepository.update.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      } as UpdateResult);
      ordersService.getOrderWithItemsById.mockResolvedValue({
        order: { id: '1' } as any,
        items: [],
      });

      // Act
      const result = await paymentService.paymentCallback(paymentMethod, callbackDto);

      // Assert
      expect(result).toHaveProperty('success');
      expect(alipayService.handleCallback).toHaveBeenCalledWith(callbackDto);
    });

    it('应该成功处理微信支付回调', async () => {
      // Arrange
      const paymentMethod = 'wechatpay';
      const callbackDto: PaymentCallbackDto = {
        signature: 'test-signature',
        timestamp: '1234567890',
        nonce: 'test-nonce',
        body: JSON.stringify({
          out_trade_no: 'TEST202401010001',
          transaction_id: 'WX202401011234567890',
          amount: { total: 8000 },
          success_time: '2024-01-01T12:00:00+08:00',
        }),
        serial: 'test-serial',
      };

      paymentRecordRepository.findOne.mockResolvedValue(mockPaymentRecord);
      wechatPayService.handleCallback.mockResolvedValue({
        success: true,
        outTradeNo: 'TEST202401010001',
        tradeNo: 'WX202401011234567890',
        amount: 80,
        payTime: new Date('2024-01-01 12:00:00'),
      });
      paymentRecordRepository.update.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      } as UpdateResult);
      ordersService.getOrderWithItemsById.mockResolvedValue({
        order: { id: '1' } as any,
        items: [],
      });

      // Act
      const result = await paymentService.paymentCallback(paymentMethod, callbackDto);

      // Assert
      expect(result).toHaveProperty('success');
      expect(wechatPayService.handleCallback).toHaveBeenCalledWith(callbackDto);
    });
  });

  describe('refund', () => {
    it('应该成功处理退款', async () => {
      // Arrange
      const orderId = '1';
      const refundAmount = 80;
      const refundReason = '商品质量问题';
      const paidPaymentRecord = { ...mockPaymentRecord, status: 1, paymentMethodCode: 'alipay' };

      paymentRecordRepository.findOne.mockResolvedValue(paidPaymentRecord);
      alipayService.refund.mockResolvedValue({ success: true, refundNo: 'REFUND202401010001' });

      // Act
      const result = await paymentService.refund(orderId, refundAmount, refundReason);

      // Assert
      expect(result).toHaveProperty('success');
      expect(alipayService.refund).toHaveBeenCalled();
    });
  });
});
