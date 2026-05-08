import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Cart } from './entities/cart.entity';

@ApiTags('购物车管理')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: '购物车模块API根路径' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getCartRoot() {
    return {
      success: true,
      message: '购物车模块API',
      data: { name: 'MallEco Cart API', version: '1.0.0' },
    };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户购物车列表' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findByUserId(@Param('userId') userId: string) {
    const list = await this.cartService.findByUserId(userId);
    return { success: true, data: list };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取购物车商品详情' })
  @ApiParam({ name: 'id', description: '购物车商品ID' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async findById(@Param('id') id: string) {
    const cart = await this.cartService.findById(id);
    return { success: true, data: cart };
  }

  @Post()
  @ApiOperation({ summary: '添加商品到购物车' })
  @ApiQuery({ name: 'userId', description: '用户ID' })
  @ApiBody({ description: '购物车商品信息' })
  @ApiResponse({ status: 201, description: '添加成功' })
  async addItem(@Query('userId') userId: string, @Body() dto: AddCartItemDto) {
    const result = await this.cartService.addItem(userId, dto);
    return { success: true, data: result, message: '添加成功' };
  }

  @Put(':id')
  @ApiOperation({ summary: '更新购物车商品' })
  @ApiParam({ name: 'id', description: '购物车商品ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async updateItem(@Param('id') id: string, @Body() dto: UpdateCartItemDto) {
    const result = await this.cartService.updateItem(id, dto);
    return { success: true, data: result };
  }

  @Put('selected')
  @ApiOperation({ summary: '批量更新选中状态' })
  @ApiQuery({ name: 'userId', description: '用户ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateItemsSelected(
    @Query('userId') userId: string,
    @Body() body: { selected: boolean; ids?: string[] },
  ) {
    await this.cartService.updateItemsSelected(userId, body.selected, body.ids);
    return { success: true, message: '更新成功' };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除购物车商品' })
  @ApiParam({ name: 'id', description: '购物车商品ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async removeItem(@Param('id') id: string) {
    await this.cartService.removeItem(id);
    return { success: true, message: '删除成功' };
  }

  @Delete()
  @ApiOperation({ summary: '批量删除购物车商品' })
  @ApiBody({ schema: { example: { ids: ['1', '2'] } } })
  @ApiResponse({ status: 200, description: '删除成功' })
  async removeItems(@Body('ids') ids: string[]) {
    await this.cartService.removeItems(ids);
    return { success: true, message: '删除成功' };
  }

  @Delete('clear/:userId')
  @ApiOperation({ summary: '清空购物车' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  @ApiResponse({ status: 200, description: '清空成功' })
  async clearCart(@Param('userId') userId: string) {
    await this.cartService.clearCart(userId);
    return { success: true, message: '清空成功' };
  }

  @Get('statistics/:userId')
  @ApiOperation({ summary: '获取购物车统计信息' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getCartStatistics(@Param('userId') userId: string) {
    const stats = await this.cartService.getCartStatistics(userId);
    return { success: true, data: stats };
  }
}
