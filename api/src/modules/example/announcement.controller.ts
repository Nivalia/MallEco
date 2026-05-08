import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnnouncementService } from './announcement.service';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  ListQueryAnnouncementDto,
} from './dto/announcement.dto';
import { Public } from '../../shared/decorators/auth.decorator';

@ApiTags('公告管理')
@Controller('announcements')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Post()
  @ApiOperation({ summary: '创建公告' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  async create(@Body() createDto: CreateAnnouncementDto) {
    return this.announcementService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: '获取公告列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Query() query: ListQueryAnnouncementDto) {
    return this.announcementService.findAll(query);
  }

  @Get('published')
  @Public()
  @ApiOperation({ summary: '获取已发布公告列表(公开)' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findPublished(@Query() query: ListQueryAnnouncementDto) {
    return this.announcementService.findPublished(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取公告详情' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '公告不存在' })
  async findOne(@Param('id') id: string) {
    return this.announcementService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新公告' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '公告不存在' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateAnnouncementDto) {
    return this.announcementService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除公告' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '公告不存在' })
  async remove(@Param('id') id: string) {
    return this.announcementService.remove(id);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: '发布公告' })
  @ApiResponse({ status: 200, description: '发布成功' })
  @ApiResponse({ status: 404, description: '公告不存在' })
  async publish(@Param('id') id: string) {
    return this.announcementService.publish(id);
  }
}
