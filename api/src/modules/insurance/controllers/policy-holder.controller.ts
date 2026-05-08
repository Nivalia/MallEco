import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PolicyHolderService } from '../services/policy-holder.service';
import { CreatePolicyHolderDto } from '../dto/create-policy-holder.dto';
import { UpdatePolicyHolderDto } from '../dto/update-policy-holder.dto';
import { PaginationDto } from '@shared/dto/common.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('保险台账 - 投保人管理')
@Controller('insurance/policy-holders')
export class PolicyHolderController {
  constructor(private readonly policyHolderService: PolicyHolderService) {}

  @Post()
  @ApiOperation({ summary: '创建投保人' })
  @ApiResponse({ status: 201, description: '投保人创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  create(@Body() createPolicyHolderDto: CreatePolicyHolderDto) {
    return this.policyHolderService.create(createPolicyHolderDto);
  }

  @Get()
  @ApiOperation({ summary: '查询投保人列表' })
  @ApiResponse({ status: 200, description: '获取投保人列表成功' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.policyHolderService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询投保人' })
  @ApiResponse({ status: 200, description: '获取投保人信息成功' })
  @ApiResponse({ status: 404, description: '投保人不存在' })
  findOne(@Param('id') id: string) {
    return this.policyHolderService.findOne(id);
  }

  @Get('license/:licensePlate')
  @ApiOperation({ summary: '根据车牌号查询投保人' })
  @ApiResponse({ status: 200, description: '获取投保人信息成功' })
  @ApiResponse({ status: 404, description: '投保人不存在' })
  findByLicensePlate(@Param('licensePlate') licensePlate: string) {
    return this.policyHolderService.findByLicensePlate(licensePlate);
  }

  @Get('phone/:phone')
  @ApiOperation({ summary: '根据手机号查询投保人' })
  @ApiResponse({ status: 200, description: '获取投保人信息成功' })
  @ApiResponse({ status: 404, description: '投保人不存在' })
  findByPhone(@Param('phone') phone: string) {
    return this.policyHolderService.findByPhone(phone);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新投保人信息' })
  @ApiResponse({ status: 200, description: '投保人信息更新成功' })
  @ApiResponse({ status: 404, description: '投保人不存在' })
  update(@Param('id') id: string, @Body() updatePolicyHolderDto: UpdatePolicyHolderDto) {
    return this.policyHolderService.update(id, updatePolicyHolderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除投保人' })
  @ApiResponse({ status: 200, description: '投保人删除成功' })
  @ApiResponse({ status: 404, description: '投保人不存在' })
  remove(@Param('id') id: string) {
    return this.policyHolderService.remove(id);
  }
}
