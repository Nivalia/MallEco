import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, FindOptionsWhere } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto, UpdateOrderStatusDto, QueryOrderDto } from './dto';
import { CacheProtectionService } from '../../infrastructure/cache/cache-protection.service';
import { GoodsService } from '../goods/goods.service';
import { ErrorCode, getErrorMessage } from '../../shared/exceptions/error-code';
import { PaginatedResponse, PaginatedResponseDto } from '../../shared/dto/response.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly cacheProtectionService: CacheProtectionService,
    private readonly goodsService: GoodsService,
  ) {}

  private generateOrderSn(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000) % 10000;
    return `ORD${timestamp}${random.toString().padStart(4, '0')}`;
  }

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    for (const item of dto.items) {
      try {
        await this.goodsService.checkGoodsStock(item.productId.toString(), item.quantity);
      } catch (error) {
        throw new BadRequestException({
          code: ErrorCode.ORD_CREATE_FAILED,
          message: `商品 ${item.productName} 库存不足`,
        });
      }
    }

    const totalAmount = dto.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = dto.shippingFee || 0;
    const couponAmount = dto.couponAmount || 0;
    const payAmount = totalAmount + shippingFee - couponAmount;

    const order = this.orderRepository.create({
      orderSn: this.generateOrderSn(),
      userId: dto.userId,
      totalAmount,
      payAmount,
      couponAmount,
      shippingFee,
      payType: dto.payType,
      status: 0,
      consignee: dto.consignee,
      mobile: dto.mobile,
      province: dto.province,
      city: dto.city,
      district: dto.district,
      address: dto.address,
      zipCode: dto.zipCode,
      userNote: dto.userNote,
      isDeleted: 0,
    });

    const savedOrder = await this.orderRepository.save(order);

    const orderItems = dto.items.map(itemDto => {
      return this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: itemDto.productId,
        productName: itemDto.productName,
        productImage: itemDto.productImage,
        productSku: itemDto.productSku,
        price: itemDto.price,
        quantity: itemDto.quantity,
        totalPrice: itemDto.price * itemDto.quantity,
        isDeleted: 0,
      });
    });

    await this.orderItemRepository.save(orderItems);

    this.logger.log(`订单创建成功: ${savedOrder.id}`, 'OrdersService');

    return savedOrder;
  }

  async findAll(query: QueryOrderDto): Promise<PaginatedResponse<Order>> {
    const {
      page = 1,
      limit = 10,
      userId,
      status,
      payType,
      orderSn,
      mobile,
      orderBy = 'createdAt',
      orderType = 'DESC',
    } = query;

    const where: FindOptionsWhere<Order> = { isDeleted: 0 };

    if (userId) where.userId = userId;
    if (status !== undefined) where.status = status;
    if (payType) where.payType = payType;
    if (orderSn) where.orderSn = Like(`%${orderSn}%`);
    if (mobile) where.mobile = Like(`%${mobile}%`);

    const result = await this.orderRepository.findAndCount({
      where,
      order: { [orderBy]: orderType },
      skip: (page - 1) * limit,
      take: limit,
    });

    return PaginatedResponseDto.create(result[0], result[1], page, limit);
  }

  async findById(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id, isDeleted: 0 },
    });

    if (!order) {
      throw new NotFoundException({
        code: ErrorCode.ORD_NOT_FOUND,
        message: getErrorMessage(ErrorCode.ORD_NOT_FOUND),
      });
    }

    return order;
  }

  async getOrderById(id: string): Promise<Order> {
    const cacheKey = `order:detail:${id}`;

    return await this.cacheProtectionService.getWithPenetrationProtection(
      cacheKey,
      async () => {
        return await this.findById(id);
      },
      3600,
    );
  }

  async getOrderWithItemsById(id: string): Promise<{ order: Order; items: OrderItem[] }> {
    const cacheKey = `order:detail:${id}:withItems`;

    return await this.cacheProtectionService.getWithPenetrationProtection(
      cacheKey,
      async () => {
        const order = await this.findById(id);
        const items = await this.orderItemRepository.find({
          where: { orderId: id, isDeleted: 0 },
        });
        return { order, items };
      },
      3600,
    );
  }

  async getOrdersByUserId(userId: string, status?: number): Promise<Order[]> {
    const cacheKey = `order:list:${userId}:${status || 'all'}`;

    return await this.cacheProtectionService.getWithPenetrationProtection(
      cacheKey,
      async () => {
        const where: FindOptionsWhere<Order> = { userId, isDeleted: 0 };
        if (status !== undefined) where.status = status;

        return await this.orderRepository.find({
          where,
          order: { createdAt: 'DESC' },
        });
      },
      3600,
    );
  }

  async updateOrderStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findById(id);

    if (!this.canUpdateStatus(order.status, dto.status)) {
      throw new BadRequestException({
        code: ErrorCode.ORD_STATUS_INVALID,
        message: getErrorMessage(ErrorCode.ORD_STATUS_INVALID),
      });
    }

    order.status = dto.status;

    if (dto.status === 1 && !order.shippingTime) {
      order.shippingTime = new Date();
    } else if (dto.status === 2 && !order.confirmTime) {
      order.confirmTime = new Date();
    } else if (dto.status === 4 && !order.endTime) {
      order.endTime = new Date();
    } else if (dto.status === 5 && !order.endTime) {
      order.endTime = new Date();
    }

    if (dto.adminNote) {
      order.adminNote = dto.adminNote;
    }

    const updatedOrder = await this.orderRepository.save(order);

    await this.clearOrderCache(updatedOrder);

    this.logger.log(`订单状态更新成功: ${id}, 状态: ${dto.status}`, 'OrdersService');

    return updatedOrder;
  }

  private canUpdateStatus(currentStatus: number, newStatus: number): boolean {
    const allowedTransitions: Record<number, number[]> = {
      0: [1, 5],
      1: [2, 5],
      2: [3],
      3: [4],
      4: [],
      5: [],
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
  }

  async deleteOrder(id: string): Promise<void> {
    await this.findById(id);

    const queryRunner = this.orderRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(Order, { id, isDeleted: 0 }, { isDeleted: 1 });
      await queryRunner.manager.update(OrderItem, { orderId: id, isDeleted: 0 }, { isDeleted: 1 });

      await queryRunner.commitTransaction();

      await this.clearOrderCacheById(id);

      this.logger.log(`订单删除成功: ${id}`, 'OrdersService');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async clearOrderCache(order: Order): Promise<void> {
    const cacheKeys = [
      `order:detail:${order.id}`,
      `order:detail:${order.id}:withItems`,
      `order:list:${order.userId}:${order.status}`,
      `order:list:${order.userId}:all`,
    ];

    await this.cacheProtectionService.deleteBatch(cacheKeys);
  }

  private async clearOrderCacheById(id: string): Promise<void> {
    const cacheKeys = [`order:detail:${id}`, `order:detail:${id}:withItems`];

    await this.cacheProtectionService.deleteBatch(cacheKeys);
  }
}
