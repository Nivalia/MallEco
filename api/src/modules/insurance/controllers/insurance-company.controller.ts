import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InsuranceCompanyService } from '../services/insurance-company.service';
import { CreateInsuranceCompanyDto } from '../dto/create-insurance-company.dto';
import { UpdateInsuranceCompanyDto } from '../dto/update-insurance-company.dto';
import { PaginationDto } from '@shared/dto/common.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('保险台账 - 保险公司管理')
@Controller('insurance/companies')
export class InsuranceCompanyController {
  constructor(private readonly insuranceCompanyService: InsuranceCompanyService) {}

  @Post()
  @ApiOperation({ summary: '创建保险公司' })
  @ApiResponse({ status: 201, description: '保险公司创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  create(@Body() createInsuranceCompanyDto: CreateInsuranceCompanyDto) {
    return this.insuranceCompanyService.create(createInsuranceCompanyDto);
  }

  @Get()
  @ApiOperation({ summary: '查询保险公司列表' })
  @ApiResponse({ status: 200, description: '获取保险公司列表成功' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.insuranceCompanyService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询保险公司' })
  @ApiResponse({ status: 200, description: '获取保险公司信息成功' })
  @ApiResponse({ status: 404, description: '保险公司不存在' })
  findOne(@Param('id') id: string) {
    return this.insuranceCompanyService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: '根据代码查询保险公司' })
  @ApiResponse({ status: 200, description: '获取保险公司信息成功' })
  @ApiResponse({ status: 404, description: '保险公司不存在' })
  findByCode(@Param('code') code: string) {
    return this.insuranceCompanyService.findByCode(code);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新保险公司信息' })
  @ApiResponse({ status: 200, description: '保险公司信息更新成功' })
  @ApiResponse({ status: 404, description: '保险公司不存在' })
  update(@Param('id') id: string, @Body() updateInsuranceCompanyDto: UpdateInsuranceCompanyDto) {
    return this.insuranceCompanyService.update(id, updateInsuranceCompanyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除保险公司' })
  @ApiResponse({ status: 200, description: '保险公司删除成功' })
  @ApiResponse({ status: 404, description: '保险公司不存在' })
  remove(@Param('id') id: string) {
    return this.insuranceCompanyService.remove(id);
  }
}
