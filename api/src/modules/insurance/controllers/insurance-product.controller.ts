import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InsuranceProductService } from '../services/insurance-product.service';
import { CreateInsuranceProductDto } from '../dto/create-insurance-product.dto';
import { UpdateInsuranceProductDto } from '../dto/update-insurance-product.dto';
import { PaginationDto } from '@shared/dto/common.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('保险台账 - 保险产品管理')
@Controller('insurance/products')
export class InsuranceProductController {
  constructor(private readonly insuranceProductService: InsuranceProductService) {}

  @Post()
  @ApiOperation({ summary: '创建保险产品' })
  @ApiResponse({ status: 201, description: '保险产品创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  create(@Body() createInsuranceProductDto: CreateInsuranceProductDto) {
    return this.insuranceProductService.create(createInsuranceProductDto);
  }

  @Get()
  @ApiOperation({ summary: '查询保险产品列表' })
  @ApiResponse({ status: 200, description: '获取保险产品列表成功' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.insuranceProductService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询保险产品' })
  @ApiResponse({ status: 200, description: '获取保险产品信息成功' })
  @ApiResponse({ status: 404, description: '保险产品不存在' })
  findOne(@Param('id') id: string) {
    return this.insuranceProductService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: '根据代码查询保险产品' })
  @ApiResponse({ status: 200, description: '获取保险产品信息成功' })
  @ApiResponse({ status: 404, description: '保险产品不存在' })
  findByCode(@Param('code') code: string) {
    return this.insuranceProductService.findByCode(code);
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: '根据保险公司查询保险产品' })
  @ApiResponse({ status: 200, description: '获取保险产品列表成功' })
  findByCompany(@Param('companyId') companyId: string) {
    return this.insuranceProductService.findByCompany(companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新保险产品信息' })
  @ApiResponse({ status: 200, description: '保险产品信息更新成功' })
  @ApiResponse({ status: 404, description: '保险产品不存在' })
  update(@Param('id') id: string, @Body() updateInsuranceProductDto: UpdateInsuranceProductDto) {
    return this.insuranceProductService.update(id, updateInsuranceProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除保险产品' })
  @ApiResponse({ status: 200, description: '保险产品删除成功' })
  @ApiResponse({ status: 404, description: '保险产品不存在' })
  remove(@Param('id') id: string) {
    return this.insuranceProductService.remove(id);
  }
}
