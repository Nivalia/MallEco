import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { PreventDuplicateSubmissions } from '../../shared/aop/decorators/prevent-duplicate-submissions.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, QueryOrderDto } from './dto';

@ApiTags('订单管理')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @PreventDuplicateSubmissions({ expire: 5 })
  @ApiOperation({ summary: '创建订单', description: '创建一个新的订单' })
  @ApiResponse({ status: 201, description: '订单创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误或库存不足' })
  @ApiResponse({ status: 429, description: '请勿重复提交' })
  async createOrder(@Body() dto: CreateOrderDto) {
    const order = await this.ordersService.createOrder(dto);
    return { success: true, data: order, message: '订单创建成功' };
  }

  @Get('list')
  @ApiOperation({ summary: '获取订单列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, description: '用户ID' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: '订单状态 0-待付款 1-待发货 2-待收货 3-待评价 4-已完成 5-已取消',
  })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Query() query: QueryOrderDto) {
    return await this.ordersService.findAll(query);
  }

  @Get()
  @ApiOperation({ summary: '订单模块API根路径' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getOrdersRoot() {
    return {
      success: true,
      message: 'MallEco Orders API',
      data: {
        name: 'MallEco Orders API',
        version: '1.0.0',
        endpoints: {
          createOrder: 'POST /api/orders',
          orderList: 'GET /api/orders/list',
          orderDetail: 'GET /api/orders/:id',
          userOrders: 'GET /api/orders/user?userId=xxx',
          updateStatus: 'PUT /api/orders/:id/status',
          deleteOrder: 'DELETE /api/orders/:id',
        },
      },
    };
  }

  @Get('user')
  @ApiOperation({ summary: '获取用户订单列表' })
  @ApiQuery({ name: 'userId', required: true, description: '用户ID' })
  @ApiQuery({ name: 'status', required: false, description: '订单状态' })
  @ApiResponse({ status: 200, description: '获取订单列表成功' })
  async getOrdersByUserId(@Query('userId') userId: string, @Query('status') status?: number) {
    const orders = await this.ordersService.getOrdersByUserId(userId, status);
    return { success: true, data: orders, message: '获取订单列表成功' };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiResponse({ status: 200, description: '获取订单详情成功' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  async getOrderById(@Param('id') id: string) {
    const orderWithItems = await this.ordersService.getOrderWithItemsById(id);
    return { success: true, data: orderWithItems, message: '获取订单详情成功' };
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新订单状态' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiResponse({ status: 200, description: '订单状态更新成功' })
  @ApiResponse({ status: 400, description: '订单状态不正确' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  async updateOrderStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    const order = await this.ordersService.updateOrderStatus(id, dto);
    return { success: true, data: order, message: '订单状态更新成功' };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除订单' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiResponse({ status: 200, description: '订单删除成功' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  async deleteOrder(@Param('id') id: string) {
    await this.ordersService.deleteOrder(id);
    return { success: true, message: '订单删除成功' };
  }
}
