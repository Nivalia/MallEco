import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('交易模块')
@Controller('trade')
export class TradeRootController {
  @ApiOperation({ summary: '交易模块根路径' })
  @ApiResponse({ status: 200, description: '交易模块API信息' })
  @Get()
  async getTradeRoot() {
    return {
      success: true,
      message: '交易模块API',
      data: {
        name: 'MallEco Trade API',
        version: '1.0.0',
        availableEndpoints: {
          cartAll: '/api/buyer/trade/carts/all (GET)',
          cartCount: '/api/buyer/trade/carts/count (GET)',
          cartChecked: '/api/buyer/trade/carts/checked (GET)',
          addCart: '/api/buyer/trade/carts (POST)',
          clearCart: '/api/buyer/trade/carts (DELETE)',
          createTrade: '/api/buyer/trade/carts/create/trade (POST)',
          selectCoupon: '/api/buyer/trade/carts/select/coupon (GET)',
          receiptList: '/api/buyer/trade/receipt (GET)',
          saveReceipt: '/api/buyer/trade/receipt (POST)',
          recharge: '/api/buyer/trade/recharge (POST)',
        },
      },
    };
  }
}
