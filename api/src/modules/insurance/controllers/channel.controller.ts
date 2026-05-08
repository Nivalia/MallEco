import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ChannelService } from '../services/channel.service';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { UpdateChannelDto } from '../dto/update-channel.dto';
import { PaginationDto } from '@shared/dto/common.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('保险台账 - 渠道管理')
@Controller('insurance/channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post()
  @ApiOperation({ summary: '创建渠道/业务员' })
  @ApiResponse({ status: 201, description: '渠道/业务员创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  create(@Body() createChannelDto: CreateChannelDto) {
    return this.channelService.create(createChannelDto);
  }

  @Get()
  @ApiOperation({ summary: '查询渠道/业务员列表' })
  @ApiResponse({ status: 200, description: '获取渠道/业务员列表成功' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.channelService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询渠道/业务员' })
  @ApiResponse({ status: 200, description: '获取渠道/业务员信息成功' })
  @ApiResponse({ status: 404, description: '渠道/业务员不存在' })
  findOne(@Param('id') id: string) {
    return this.channelService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: '根据代码查询渠道/业务员' })
  @ApiResponse({ status: 200, description: '获取渠道/业务员信息成功' })
  @ApiResponse({ status: 404, description: '渠道/业务员不存在' })
  findByCode(@Param('code') code: string) {
    return this.channelService.findByCode(code);
  }

  @Get('parent/:parentId')
  @ApiOperation({ summary: '查询子渠道/业务员' })
  @ApiResponse({ status: 200, description: '获取子渠道/业务员列表成功' })
  findByParent(@Param('parentId') parentId: string) {
    return this.channelService.findByParent(parentId);
  }

  @Get(':id/downstream')
  @ApiOperation({ summary: '查询下游渠道/业务员' })
  @ApiResponse({ status: 200, description: '获取下游渠道/业务员列表成功' })
  findDownstreamChannels(@Param('id') id: string) {
    return this.channelService.findDownstreamChannels(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新渠道/业务员信息' })
  @ApiResponse({ status: 200, description: '渠道/业务员信息更新成功' })
  @ApiResponse({ status: 404, description: '渠道/业务员不存在' })
  update(@Param('id') id: string, @Body() updateChannelDto: UpdateChannelDto) {
    return this.channelService.update(id, updateChannelDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除渠道/业务员' })
  @ApiResponse({ status: 200, description: '渠道/业务员删除成功' })
  @ApiResponse({ status: 404, description: '渠道/业务员不存在' })
  remove(@Param('id') id: string) {
    return this.channelService.remove(id);
  }
}
