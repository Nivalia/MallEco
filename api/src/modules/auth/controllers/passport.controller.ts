import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PassportService } from '../services/passport.service';

interface LoginData {
  username?: string;
  password?: string;
  mobile?: string;
  code?: string;
}

interface ResetData {
  oldPassword?: string;
  newPassword?: string;
  mobile?: string;
  code?: string;
}

@Controller('passport/login')
export class PassportController {
  constructor(private readonly passportService: PassportService) {}

  @Post('userLogin')
  async userLogin(@Body() loginData: LoginData) {
    return await this.passportService.userLogin(loginData);
  }

  @Post('smsLogin')
  async smsLogin(@Body() loginData: LoginData) {
    return await this.passportService.smsLogin(loginData);
  }

  @Post('logout')
  async logout() {
    return await this.passportService.logout();
  }

  @Get('refresh/:token')
  async refreshToken(@Param('token') token: string) {
    return await this.passportService.refreshToken(token);
  }

  @Post('resetPassword')
  async resetPassword(@Body() resetData: ResetData) {
    return await this.passportService.resetPassword(resetData);
  }

  @Post('modifyPass')
  async modifyPass(@Body() modifyData: ResetData) {
    return await this.passportService.modifyPass(modifyData);
  }

  @Post('resetByMobile')
  async resetByMobile(@Body() resetData: ResetData) {
    return await this.passportService.resetByMobile(resetData);
  }
}
