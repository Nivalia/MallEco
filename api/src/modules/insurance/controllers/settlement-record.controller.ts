import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SettlementRecordService } from '../services/settlement-record.service';
import { CreateSettlementRecordDto } from '../dto/create-settlement-record.dto';
import { UpdateSettlementRecordDto } from '../dto/update-settlement-record.dto';
import { PaginationDto } from '@shared/dto/common.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('保险台账 - 结算管理')
@Controller('insurance/settlements')
export class SettlementRecordController {
  constructor(private readonly settlementRecordService: SettlementRecordService) {}

  @Post()
  @ApiOperation({ summary: '创建结算记录' })
  @ApiResponse({ status: 201, description: '结算记录创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  create(@Body() createSettlementRecordDto: CreateSettlementRecordDto) {
    return this.settlementRecordService.create(createSettlementRecordDto);
  }

  @Get()
  @ApiOperation({ summary: '查询结算记录列表' })
  @ApiResponse({ status: 200, description: '获取结算记录列表成功' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.settlementRecordService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询结算记录' })
  @ApiResponse({ status: 200, description: '获取结算记录信息成功' })
  @ApiResponse({ status: 404, description: '结算记录不存在' })
  findOne(@Param('id') id: string) {
    return this.settlementRecordService.findOne(id);
  }

  @Get(':id/details')
  @ApiOperation({ summary: '查询结算记录明细' })
  @ApiResponse({ status: 200, description: '获取结算记录明细成功' })
  @ApiResponse({ status: 404, description: '结算记录不存在' })
  findDetails(@Param('id') id: string) {
    return this.settlementRecordService.findDetails(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新结算记录信息' })
  @ApiResponse({ status: 200, description: '结算记录信息更新成功' })
  @ApiResponse({ status: 404, description: '结算记录不存在' })
  update(@Param('id') id: string, @Body() updateSettlementRecordDto: UpdateSettlementRecordDto) {
    return this.settlementRecordService.update(id, updateSettlementRecordDto);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: '确认结算记录' })
  @ApiResponse({ status: 200, description: '结算记录确认成功' })
  @ApiResponse({ status: 404, description: '结算记录不存在' })
  confirm(@Param('id') id: string, @Body() confirmData: { confirmedBy: string }) {
    return this.settlementRecordService.confirm(id, confirmData.confirmedBy);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: '支付结算记录' })
  @ApiResponse({ status: 200, description: '结算记录支付成功' })
  @ApiResponse({ status: 404, description: '结算记录不存在' })
  pay(@Param('id') id: string, @Body() payData: { paidBy: string }) {
    return this.settlementRecordService.pay(id, payData.paidBy);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: '取消结算记录' })
  @ApiResponse({ status: 200, description: '结算记录取消成功' })
  @ApiResponse({ status: 404, description: '结算记录不存在' })
  cancel(@Param('id') id: string) {
    return this.settlementRecordService.cancel(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除结算记录' })
  @ApiResponse({ status: 200, description: '结算记录删除成功' })
  @ApiResponse({ status: 404, description: '结算记录不存在' })
  remove(@Param('id') id: string) {
    return this.settlementRecordService.remove(id);
  }

  @Get(':id/export')
  @ApiOperation({ summary: '导出结算单' })
  @ApiResponse({ status: 200, description: '结算单导出成功' })
  @ApiResponse({ status: 404, description: '结算记录不存在' })
  async exportSettlement(@Param('id') id: string) {
    const filePath = await this.settlementRecordService.exportSettlement(id);
    return {
      success: true,
      message: '结算单导出成功',
      filePath: filePath,
    };
  }
}
