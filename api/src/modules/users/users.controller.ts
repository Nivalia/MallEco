import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  QueryUserDto,
  ChangePasswordDto,
  ResetPasswordDto,
} from './dto';
import { Public } from '../../shared/decorators/auth.decorator';

@ApiTags('用户管理')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({
    status: 201,
    description: '用户创建成功',
    schema: { example: { id: '1', username: 'john' } },
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '用户已存在' })
  async create(@Body() createDto: CreateUserDto) {
    return await this.usersService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', type: Number })
  @ApiQuery({ name: 'keyword', required: false, description: '关键词搜索' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: '用户状态',
    enum: ['active', 'inactive', 'banned'],
  })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Query() query: QueryUserDto) {
    return await this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取用户' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '获取用户成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async findById(@Param('id') id: string) {
    return await this.usersService.findById(id);
  }

  @Get('condition/query')
  @ApiOperation({ summary: '根据条件查询用户' })
  @ApiQuery({ name: 'username', required: false, description: '用户名' })
  @ApiQuery({ name: 'email', required: false, description: '邮箱' })
  @ApiQuery({ name: 'phone', required: false, description: '手机号' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findByCondition(@Query() query: { username?: string; email?: string; phone?: string }) {
    return await this.usersService.findByCondition(query);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '更新用户成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 409, description: '用户名/邮箱/手机号已存在' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateUserDto) {
    return await this.usersService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '删除用户成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async delete(@Param('id') id: string) {
    await this.usersService.delete(id);
    return { success: true, message: '删除成功' };
  }

  @Post(':id/password')
  @ApiOperation({ summary: '修改密码' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '密码修改成功' })
  @ApiResponse({ status: 400, description: '旧密码错误' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async changePassword(@Param('id') id: string, @Body() changePasswordDto: ChangePasswordDto) {
    await this.usersService.changePassword(
      id,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
    return { success: true, message: '密码修改成功' };
  }

  @Post(':id/balance')
  @ApiOperation({ summary: '更新用户余额' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '余额更新成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async updateBalance(
    @Param('id') id: string,
    @Body() body: { amount: number; operation: 'add' | 'subtract' },
  ) {
    return await this.usersService.updateBalance(id, body.amount, body.operation);
  }
}
