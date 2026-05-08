import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('会员模块')
@Controller('member')
export class MemberRootController {
  @ApiOperation({ summary: '会员模块根路径' })
  @ApiResponse({ status: 200, description: '会员模块API信息' })
  @Get()
  async getMemberRoot() {
    return {
      success: true,
      message: '会员模块API',
      data: {
        name: 'MallEco Member API',
        version: '1.0.0',
        availableEndpoints: {
          collection: '/api/buyer/member/collection (GET)',
          storeCollection: '/api/buyer/member/storeCollection (GET)',
          evaluation: '/api/buyer/member/evaluation (GET)',
          footprint: '/api/buyer/member/footprint (GET)',
          memberPoints: '/api/buyer/member/memberPointsHistory (GET)',
          message: '/api/buyer/member/message/member (GET)',
          withdrawApply: '/api/buyer/member/withdrawApply (GET)',
        },
      },
    };
  }
}
