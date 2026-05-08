import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ErrorCode, getErrorMessage } from '../../shared/exceptions/error-code';
import { PaginatedResponse } from '../../shared/dto/response.dto';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  ) {}

  async findByUserId(userId: string): Promise<Cart[]> {
    return await this.cartRepository.find({
      where: { userId, isDeleted: 0 },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id, isDeleted: 0 },
    });
    if (!cart) {
      throw new NotFoundException({
        code: ErrorCode.CART_ITEM_NOT_FOUND,
        message: getErrorMessage(ErrorCode.CART_ITEM_NOT_FOUND),
      });
    }
    return cart;
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<Cart> {
    const existItem = await this.cartRepository.findOne({
      where: { userId, productId: dto.productId, isDeleted: 0 },
    });

    if (existItem) {
      existItem.quantity += dto.quantity;
      const result = await this.cartRepository.save(existItem);
      this.logger.log(`购物车商品数量更新: ${result.id}`, 'CartService');
      return result;
    }

    const cart = this.cartRepository.create({
      userId,
      productId: dto.productId,
      quantity: dto.quantity,
      price: dto.price,
      discount: dto.discount || 0,
      productName: dto.productName,
      productImage: dto.productImage,
      productAttributes: dto.productAttributes,
      selected: 1,
    });

    const result = await this.cartRepository.save(cart);
    this.logger.log(`购物车商品添加: ${result.id}`, 'CartService');
    return result;
  }

  async updateItem(id: string, dto: UpdateCartItemDto): Promise<Cart | void> {
    const cart = await this.findById(id);

    if (dto.quantity !== undefined) {
      if (dto.quantity <= 0) {
        return await this.removeItem(id);
      }
      cart.quantity = dto.quantity;
    }

    if (dto.selected !== undefined) {
      cart.selected = dto.selected ? 1 : 0;
    }

    const result = await this.cartRepository.save(cart);
    this.logger.log(`购物车商品更新: ${id}`, 'CartService');
    return result;
  }

  async updateItemsSelected(userId: string, selected: boolean, ids?: string[]): Promise<void> {
    const where: any = { userId, isDeleted: 0 };
    if (ids && ids.length > 0) {
      where.id = ids;
    }

    await this.cartRepository.update(where, { selected: selected ? 1 : 0 });
    this.logger.log(`购物车选中状态更新: userId=${userId}`, 'CartService');
  }

  async removeItem(id: string): Promise<void> {
    await this.findById(id);
    await this.cartRepository.softDelete({ id });
    this.logger.log(`购物车商品删除: ${id}`, 'CartService');
  }

  async removeItems(ids: string[]): Promise<void> {
    await this.cartRepository.softDelete({ id: ids as any });
    this.logger.log(`购物车商品批量删除: ${ids.join(',')}`, 'CartService');
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartRepository.softDelete({ userId, isDeleted: 0 });
    this.logger.log(`清空购物车: userId=${userId}`, 'CartService');
  }

  async getCartStatistics(userId: string) {
    const carts = await this.findByUserId(userId);

    const totalItems = carts.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = carts.reduce(
      (sum, item) => sum + (item.price - item.discount) * item.quantity,
      0,
    );

    const selectedCarts = carts.filter(item => item.selected === 1);
    const selectedItems = selectedCarts.reduce((sum, item) => sum + item.quantity, 0);
    const selectedPrice = selectedCarts.reduce(
      (sum, item) => sum + (item.price - item.discount) * item.quantity,
      0,
    );

    return { totalItems, totalPrice, selectedItems, selectedPrice };
  }
}
