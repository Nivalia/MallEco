import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { InsurancePolicyService } from '../services/insurance-policy.service';
import { CreateInsurancePolicyDto } from '../dto/create-insurance-policy.dto';
import { UpdateInsurancePolicyDto } from '../dto/update-insurance-policy.dto';
import { PaginationDto } from '@shared/dto/common.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Express } from 'express';

@ApiTags('保险台账 - 保单管理')
@Controller('insurance/policies')
export class InsurancePolicyController {
  constructor(private readonly insurancePolicyService: InsurancePolicyService) {}

  @Post()
  @ApiOperation({ summary: '创建保单' })
  @ApiResponse({ status: 201, description: '保单创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  create(@Body() createInsurancePolicyDto: CreateInsurancePolicyDto) {
    return this.insurancePolicyService.create(createInsurancePolicyDto);
  }

  @Get()
  @ApiOperation({ summary: '查询保单列表' })
  @ApiResponse({ status: 200, description: '获取保单列表成功' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.insurancePolicyService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询保单' })
  @ApiResponse({ status: 200, description: '获取保单信息成功' })
  @ApiResponse({ status: 404, description: '保单不存在' })
  findOne(@Param('id') id: string) {
    return this.insurancePolicyService.findOne(id);
  }

  @Get('number/:policyNumber')
  @ApiOperation({ summary: '根据保单号查询保单' })
  @ApiResponse({ status: 200, description: '获取保单信息成功' })
  @ApiResponse({ status: 404, description: '保单不存在' })
  findByPolicyNumber(@Param('policyNumber') policyNumber: string) {
    return this.insurancePolicyService.findByPolicyNumber(policyNumber);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新保单信息' })
  @ApiResponse({ status: 200, description: '保单信息更新成功' })
  @ApiResponse({ status: 404, description: '保单不存在' })
  update(@Param('id') id: string, @Body() updateInsurancePolicyDto: UpdateInsurancePolicyDto) {
    return this.insurancePolicyService.update(id, updateInsurancePolicyDto);
  }

  @Post(':id/audit')
  @ApiOperation({ summary: '审核保单' })
  @ApiResponse({ status: 200, description: '保单审核成功' })
  @ApiResponse({ status: 404, description: '保单不存在' })
  audit(
    @Param('id') id: string,
    @Body() auditData: { auditStatus: number; auditBy: string; auditRemark?: string },
  ) {
    return this.insurancePolicyService.audit(
      id,
      auditData.auditStatus,
      auditData.auditBy,
      auditData.auditRemark,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除保单' })
  @ApiResponse({ status: 200, description: '保单删除成功' })
  @ApiResponse({ status: 404, description: '保单不存在' })
  remove(@Param('id') id: string) {
    return this.insurancePolicyService.remove(id);
  }

  @Post('batch-import')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/insurance',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(excel|xlsx|xls)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only Excel files are allowed!'), false);
        }
      },
    }),
  )
  @ApiOperation({ summary: '批量导入保单' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: '批量导入成功' })
  @ApiResponse({ status: 400, description: '请求参数错误或文件格式不正确' })
  async batchImport(@UploadedFile() file: Express.Multer.File) {
    return this.insurancePolicyService.batchImport(file);
  }
}
