import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('店铺模块')
@Controller('store')
export class StoreRootController {
  @ApiOperation({ summary: '店铺模块根路径' })
  @ApiResponse({ status: 200, description: '店铺模块API信息' })
  @Get()
  async getStoreRoot() {
    return {
      success: true,
      message: '店铺模块API',
      data: {
        name: 'MallEco Store API',
        version: '1.0.0',
        availableEndpoints: {
          detail: '/api/buyer/store/getStoreDetail (GET)',
          list: '/api/buyer/store/list (GET)',
          goodsList: '/api/buyer/store/goods/list (GET)',
          categoryList: '/api/buyer/store/goods/category/list (GET)',
          collectionAdd: '/api/buyer/store/collection/add (POST)',
          collectionCancel: '/api/buyer/store/collection/cancel (POST)',
          collectionList: '/api/buyer/store/collection/list (GET)',
        },
      },
    };
  }
}
