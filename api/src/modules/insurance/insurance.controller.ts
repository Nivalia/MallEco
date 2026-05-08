import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('保险模块')
@Controller('insurance')
export class InsuranceController {
  @Get()
  @ApiOperation({ summary: '保险模块根路径' })
  @ApiResponse({ status: 200, description: '保险模块API信息' })
  async getInsuranceRoot() {
    return {
      success: true,
      message: '保险模块API',
      data: {
        name: 'MallEco Insurance API',
        version: '1.0.0',
        availableEndpoints: {
          companies: '/api/insurance/companies',
          products: '/api/insurance/products',
          policies: '/api/insurance/policies',
          statistics: '/api/insurance/statistics',
        },
      },
    };
  }
}
