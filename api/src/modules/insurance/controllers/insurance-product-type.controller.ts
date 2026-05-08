import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InsuranceProductTypeService } from '../services/insurance-product-type.service';
import { CreateInsuranceProductTypeDto } from '../dto/create-insurance-product-type.dto';
import { UpdateInsuranceProductTypeDto } from '../dto/update-insurance-product-type.dto';
import { PaginationDto } from '@shared/dto/common.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('保险台账 - 保险产品类型管理')
@Controller('insurance/product-types')
export class InsuranceProductTypeController {
  constructor(private readonly insuranceProductTypeService: InsuranceProductTypeService) {}

  @Post()
  @ApiOperation({ summary: '创建保险产品类型' })
  @ApiResponse({ status: 201, description: '保险产品类型创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '类型编码已存在' })
  create(@Body() createInsuranceProductTypeDto: CreateInsuranceProductTypeDto) {
    return this.insuranceProductTypeService.create(createInsuranceProductTypeDto);
  }

  @Get()
  @ApiOperation({ summary: '查询保险产品类型列表' })
  @ApiResponse({ status: 200, description: '获取保险产品类型列表成功' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.insuranceProductTypeService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询保险产品类型' })
  @ApiResponse({ status: 200, description: '获取保险产品类型信息成功' })
  @ApiResponse({ status: 404, description: '保险产品类型不存在' })
  findOne(@Param('id') id: string) {
    return this.insuranceProductTypeService.findOne(id);
  }

  @Get('code/:typeCode')
  @ApiOperation({ summary: '根据类型编码查询保险产品类型' })
  @ApiResponse({ status: 200, description: '获取保险产品类型信息成功' })
  @ApiResponse({ status: 404, description: '保险产品类型不存在' })
  findByCode(@Param('typeCode') typeCode: string) {
    return this.insuranceProductTypeService.findByCode(typeCode);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新保险产品类型信息' })
  @ApiResponse({ status: 200, description: '保险产品类型信息更新成功' })
  @ApiResponse({ status: 404, description: '保险产品类型不存在' })
  @ApiResponse({ status: 409, description: '类型编码已存在' })
  update(
    @Param('id') id: string,
    @Body() updateInsuranceProductTypeDto: UpdateInsuranceProductTypeDto,
  ) {
    return this.insuranceProductTypeService.update(id, updateInsuranceProductTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除保险产品类型' })
  @ApiResponse({ status: 200, description: '保险产品类型删除成功' })
  @ApiResponse({ status: 404, description: '保险产品类型不存在' })
  remove(@Param('id') id: string) {
    return this.insuranceProductTypeService.remove(id);
  }
}
