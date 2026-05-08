import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('其他模块')
@Controller('other')
export class OtherRootController {
  @ApiOperation({ summary: '其他模块根路径' })
  @ApiResponse({ status: 200, description: '其他模块API信息' })
  @Get()
  async getOtherRoot() {
    return {
      success: true,
      message: '其他模块API',
      data: {
        name: 'MallEco Other API',
        version: '1.0.0',
        availableEndpoints: {
          indexData: '/api/buyer/other/pageData/getIndex (GET)',
          topicData: '/api/buyer/other/pageData/get/:id (GET)',
          pageData: '/api/buyer/other/pageData (GET)',
          articleList: '/api/buyer/other/article (GET)',
          articleDetail: '/api/buyer/other/article/get/:id (GET)',
          articleCategoryList: '/api/buyer/other/article/articleCategory/list (GET)',
        },
      },
    };
  }
}
