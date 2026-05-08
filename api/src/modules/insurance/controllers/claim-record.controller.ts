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
import { ClaimRecordService } from '../services/claim-record.service';
import { CreateClaimRecordDto } from '../dto/create-claim-record.dto';
import { UpdateClaimRecordDto } from '../dto/update-claim-record.dto';
import { PaginationDto } from '@shared/dto/common.dto';
import { JwtAuthGuard } from '@infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@infrastructure/auth/guards/roles.guard';
import { Roles } from '@infrastructure/auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('保险台账 - 理赔管理')
@Controller('insurance/claim-records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClaimRecordController {
  constructor(private readonly claimRecordService: ClaimRecordService) {}

  /**
   * 创建理赔记录
   * @param createClaimRecordDto 理赔记录创建数据
   * @returns 创建的理赔记录
   */
  @Post()
  @ApiOperation({ summary: '创建理赔记录' })
  @ApiResponse({ status: 201, description: '理赔记录创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @Roles('admin', 'insurance_manager')
  create(@Body() createClaimRecordDto: CreateClaimRecordDto) {
    return this.claimRecordService.create(createClaimRecordDto);
  }

  /**
   * 获取理赔记录列表
   * @param paginationDto 分页参数
   * @returns 理赔记录列表和总数
   */
  @Get()
  @ApiOperation({ summary: '查询理赔记录列表' })
  @ApiResponse({ status: 200, description: '获取理赔记录列表成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @Roles('admin', 'insurance_manager', 'insurance_staff')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.claimRecordService.findAll(paginationDto);
  }

  /**
   * 获取单个理赔记录
   * @param id 理赔记录ID
   * @returns 理赔记录详情
   */
  @Get(':id')
  @ApiOperation({ summary: '根据ID查询理赔记录' })
  @ApiResponse({ status: 200, description: '获取理赔记录信息成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '理赔记录不存在' })
  @Roles('admin', 'insurance_manager', 'insurance_staff')
  findOne(@Param('id') id: string) {
    return this.claimRecordService.findOne(id);
  }

  /**
   * 根据理赔单号查询
   * @param claimNumber 理赔单号
   * @returns 理赔记录详情
   */
  @Get('by-number/:claimNumber')
  @ApiOperation({ summary: '根据理赔单号查询' })
  @ApiResponse({ status: 200, description: '获取理赔记录信息成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '理赔记录不存在' })
  @Roles('admin', 'insurance_manager', 'insurance_staff')
  findByClaimNumber(@Param('claimNumber') claimNumber: string) {
    return this.claimRecordService.findByClaimNumber(claimNumber);
  }

  /**
   * 根据保单ID查询理赔记录
   * @param policyId 保单ID
   * @returns 理赔记录列表
   */
  @Get('by-policy/:policyId')
  @ApiOperation({ summary: '根据保单ID查询理赔记录' })
  @ApiResponse({ status: 200, description: '获取理赔记录列表成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @Roles('admin', 'insurance_manager', 'insurance_staff')
  findByPolicyId(@Param('policyId') policyId: string) {
    return this.claimRecordService.findByPolicyId(policyId);
  }

  /**
   * 更新理赔记录
   * @param id 理赔记录ID
   * @param updateClaimRecordDto 理赔记录更新数据
   * @returns 更新后的理赔记录
   */
  @Patch(':id')
  @ApiOperation({ summary: '更新理赔记录' })
  @ApiResponse({ status: 200, description: '理赔记录更新成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '理赔记录不存在' })
  @Roles('admin', 'insurance_manager')
  update(@Param('id') id: string, @Body() updateClaimRecordDto: UpdateClaimRecordDto) {
    return this.claimRecordService.update(id, updateClaimRecordDto);
  }

  /**
   * 删除理赔记录
   * @param id 理赔记录ID
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除理赔记录' })
  @ApiResponse({ status: 200, description: '理赔记录删除成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '理赔记录不存在' })
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.claimRecordService.remove(id);
  }

  /**
   * 处理理赔
   * @param id 理赔记录ID
   * @param status 理赔状态
   * @param handlerId 处理人ID
   * @param handlerName 处理人姓名
   * @param statusDescription 状态描述
   * @returns 处理后的理赔记录
   */
  @Patch(':id/process')
  @ApiOperation({ summary: '处理理赔' })
  @ApiResponse({ status: 200, description: '理赔处理成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '理赔记录不存在' })
  @Roles('admin', 'insurance_manager', 'insurance_staff')
  processClaim(
    @Param('id') id: string,
    @Body('status') status: number,
    @Body('handlerId') handlerId: string,
    @Body('handlerName') handlerName: string,
    @Body('statusDescription') statusDescription?: string,
  ) {
    return this.claimRecordService.processClaim(
      id,
      status,
      handlerId,
      handlerName,
      statusDescription,
    );
  }

  /**
   * 审核理赔记录
   * @param id 理赔记录ID
   * @param auditStatus 审核状态
   * @param auditBy 审核人
   * @param auditRemark 审核备注
   * @returns 审核后的理赔记录
   */
  @Patch(':id/audit')
  @ApiOperation({ summary: '审核理赔记录' })
  @ApiResponse({ status: 200, description: '理赔记录审核成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '理赔记录不存在' })
  @Roles('admin', 'insurance_manager')
  audit(
    @Param('id') id: string,
    @Body('auditStatus') auditStatus: number,
    @Body('auditBy') auditBy: string,
    @Body('auditRemark') auditRemark?: string,
  ) {
    return this.claimRecordService.audit(id, auditStatus, auditBy, auditRemark);
  }

  /**
   * 获取理赔统计信息
   * @returns 理赔统计数据
   */
  @Get('statistics/overview')
  @ApiOperation({ summary: '获取理赔统计信息' })
  @ApiResponse({ status: 200, description: '获取理赔统计信息成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @Roles('admin', 'insurance_manager')
  getClaimStatistics() {
    return this.claimRecordService.getClaimStatistics();
  }
}
