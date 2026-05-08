import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AddressService } from './address.service';

@ApiTags('地址管理')
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  // 传给后台citycode 获取城市街道等id
  @Get('region')
  async handleRegion(@Query() params: any) {
    return this.addressService.handleRegion(params);
  }

  @Get()
  async getAddressRoot() {
    return {
      success: true,
      message: '地址模块API',
      data: {
        name: 'MallEco Address API',
        version: '1.0.0',
        availableEndpoints: {
          region: '/api/address/region (GET)',
        },
      },
    };
  }
}
