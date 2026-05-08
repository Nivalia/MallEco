import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RenewalRecordService } from '../services/renewal-record.service';
import { CreateRenewalRecordDto } from '../dto/create-renewal-record.dto';
import { UpdateRenewalRecordDto } from '../dto/update-renewal-record.dto';
import { PaginationDto } from '@shared/dto/common.dto';
import { JwtAuthGuard } from '@infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@infrastructure/auth/guards/roles.guard';
import { Roles } from '@infrastructure/auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('保险台账 - 续保管理')
@Controller('insurance/renewal-records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RenewalRecordController {
  constructor(private readonly renewalRecordService: RenewalRecordService) {}

  /**
   * 创建续保记录
   * @param createRenewalRecordDto 续保记录创建数据
   * @returns 创建的续保记录
   */
  @Post()
  @ApiOperation({ summary: '创建续保记录' })
  @ApiResponse({ status: 201, description: '续保记录创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @Roles('admin', 'insurance_manager')
  create(@Body() createRenewalRecordDto: CreateRenewalRecordDto) {
    return this.renewalRecordService.create(createRenewalRecordDto);
  }

  /**
   * 获取续保记录列表
   * @param paginationDto 分页参数
   * @returns 续保记录列表和总数
   */
  @Get()
  @ApiOperation({ summary: '查询续保记录列表' })
  @ApiResponse({ status: 200, description: '获取续保记录列表成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @Roles('admin', 'insurance_manager', 'insurance_staff')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.renewalRecordService.findAll(paginationDto);
  }

  /**
   * 获取单个续保记录
   * @param id 续保记录ID
   * @returns 续保记录详情
   */
  @Get(':id')
  @ApiOperation({ summary: '根据ID查询续保记录' })
  @ApiResponse({ status: 200, description: '获取续保记录信息成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '续保记录不存在' })
  @Roles('admin', 'insurance_manager', 'insurance_staff')
  findOne(@Param('id') id: string) {
    return this.renewalRecordService.findOne(id);
  }

  /**
   * 根据续保单号查询
   * @param renewalNumber 续保单号
   * @returns 续保记录详情
   */
  @Get('by-number/:renewalNumber')
  @ApiOperation({ summary: '根据续保单号查询' })
  @ApiResponse({ status: 200, description: '获取续保记录信息成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '续保记录不存在' })
  @Roles('admin', 'insurance_manager', 'insurance_staff')
  findByRenewalNumber(@Param('renewalNumber') renewalNumber: string) {
    return this.renewalRecordService.findByRenewalNumber(renewalNumber);
  }

  /**
   * 根据原保单ID查询续保记录
   * @param originalPolicyId 原保单ID
   * @returns 续保记录列表
   */
  @Get('by-original-policy/:originalPolicyId')
  @ApiOperation({ summary: '根据原保单ID查询续保记录' })
  @ApiResponse({ status: 200, description: '获取续保记录列表成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @Roles('admin', 'insurance_manager', 'insurance_staff')
  findByOriginalPolicyId(@Param('originalPolicyId') originalPolicyId: string) {
    return this.renewalRecordService.findByOriginalPolicyId(originalPolicyId);
  }

  /**
   * 根据新保单ID查询续保记录
   * @param policyId 新保单ID
   * @returns 续保记录详情
   */
  @Get('by-policy/:policyId')
  @ApiOperation({ summary: '根据新保单ID查询续保记录' })
  @ApiResponse({ status: 200, description: '获取续保记录信息成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '续保记录不存在' })
  @Roles('admin', 'insurance_manager', 'insurance_staff')
  findByPolicyId(@Param('policyId') policyId: string) {
    return this.renewalRecordService.findByPolicyId(policyId);
  }

  /**
   * 更新续保记录
   * @param id 续保记录ID
   * @param updateRenewalRecordDto 续保记录更新数据
   * @returns 更新后的续保记录
   */
  @Patch(':id')
  @ApiOperation({ summary: '更新续保记录' })
  @ApiResponse({ status: 200, description: '续保记录更新成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '续保记录不存在' })
  @Roles('admin', 'insurance_manager')
  update(@Param('id') id: string, @Body() updateRenewalRecordDto: UpdateRenewalRecordDto) {
    return this.renewalRecordService.update(id, updateRenewalRecordDto);
  }

  /**
   * 删除续保记录
   * @param id 续保记录ID
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除续保记录' })
  @ApiResponse({ status: 200, description: '续保记录删除成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '续保记录不存在' })
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.renewalRecordService.remove(id);
  }

  /**
   * 处理续保
   * @param id 续保记录ID
   * @param status 续保状态
   * @param handlerId 处理人ID
   * @param handlerName 处理人姓名
   * @param statusDescription 状态描述
   * @returns 处理后的续保记录
   */
  @Patch(':id/process')
  @ApiOperation({ summary: '处理续保' })
  @ApiResponse({ status: 200, description: '续保处理成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '续保记录不存在' })
  @Roles('admin', 'insurance_manager', 'insurance_staff')
  processRenewal(
    @Param('id') id: string,
    @Body('status') status: number,
    @Body('handlerId') handlerId: string,
    @Body('handlerName') handlerName: string,
    @Body('statusDescription') statusDescription?: string,
  ) {
    return this.renewalRecordService.processRenewal(
      id,
      status,
      handlerId,
      handlerName,
      statusDescription,
    );
  }

  /**
   * 审核续保记录
   * @param id 续保记录ID
   * @param auditStatus 审核状态
   * @param auditBy 审核人
   * @param auditRemark 审核备注
   * @returns 审核后的续保记录
   */
  @Patch(':id/audit')
  @ApiOperation({ summary: '审核续保记录' })
  @ApiResponse({ status: 200, description: '续保记录审核成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '续保记录不存在' })
  @Roles('admin', 'insurance_manager')
  audit(
    @Param('id') id: string,
    @Body('auditStatus') auditStatus: number,
    @Body('auditBy') auditBy: string,
    @Body('auditRemark') auditRemark?: string,
  ) {
    return this.renewalRecordService.audit(id, auditStatus, auditBy, auditRemark);
  }

  /**
   * 获取续保统计信息
   * @returns 续保统计数据
   */
  @Get('statistics/overview')
  @ApiOperation({ summary: '获取续保统计信息' })
  @ApiResponse({ status: 200, description: '获取续保统计信息成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @Roles('admin', 'insurance_manager')
  getRenewalStatistics() {
    return this.renewalRecordService.getRenewalStatistics();
  }

  /**
   * 获取即将到期的保单
   * @param days 天数
   * @returns 即将到期的保单列表
   */
  @Get('statistics/expiring-policies')
  @ApiOperation({ summary: '获取即将到期的保单' })
  @ApiResponse({ status: 200, description: '获取即将到期的保单列表成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @Roles('admin', 'insurance_manager')
  getExpiringPolicies(@Query('days') days: number = 30) {
    return this.renewalRecordService.getExpiringPolicies(days);
  }
}
