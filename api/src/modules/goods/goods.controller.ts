import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GoodsService } from './goods.service';
import {
  CreateGoodsDto,
  UpdateGoodsDto,
  QueryGoodsDto,
  AddCollectionDto,
  AddConsultationDto,
} from './dto';

@ApiTags('商品管理')
@Controller('buyer/goods')
export class GoodsController {
  constructor(private readonly goodsService: GoodsService) {}

  @Post()
  @ApiOperation({ summary: '创建商品' })
  @ApiResponse({ status: 201, description: '商品创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '商品编号已存在' })
  async create(@Body() createDto: CreateGoodsDto) {
    return await this.goodsService.create(createDto);
  }

  @Get('list')
  @ApiOperation({ summary: '获取商品列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, description: '分类ID' })
  @ApiQuery({ name: 'keyword', required: false, description: '关键词' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getGoodsList(@Query() query: QueryGoodsDto) {
    return await this.goodsService.getGoodsList(query);
  }

  @Get('search')
  @ApiOperation({ summary: '搜索商品' })
  @ApiQuery({ name: 'keyword', required: false, description: '关键词' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: '搜索成功' })
  async searchGoods(@Query() query: QueryGoodsDto) {
    return await this.goodsService.searchGoods(query);
  }

  @Get('category/list')
  @ApiOperation({ summary: '获取商品分类列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getCategoryList() {
    return await this.goodsService.getCategoryList();
  }

  @Get('sku/list')
  @ApiOperation({ summary: '获取商品规格列表' })
  @ApiParam({ name: 'goodsId', description: '商品ID' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async getSkuList(@Query('goodsId') goodsId: string) {
    return await this.goodsService.getSkuList(goodsId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取商品详情' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async getGoodsDetail(@Param('id') id: string) {
    return await this.goodsService.getGoodsDetail(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新商品' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateGoodsDto) {
    return await this.goodsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除商品' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async delete(@Param('id') id: string) {
    await this.goodsService.delete(id);
    return { success: true, message: '删除成功' };
  }

  @Get('evaluation/page')
  @ApiOperation({ summary: '获取商品评价' })
  @ApiQuery({ name: 'goodsId', required: true, description: '商品ID' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getGoodsEvaluation(@Query('goodsId') goodsId: string, @Query() query: QueryGoodsDto) {
    return await this.goodsService.getGoodsEvaluation(goodsId, query);
  }

  @Get('consultation/page')
  @ApiOperation({ summary: '获取商品咨询' })
  @ApiQuery({ name: 'goodsId', required: true, description: '商品ID' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getGoodsConsultation(@Query('goodsId') goodsId: string, @Query() query: QueryGoodsDto) {
    return await this.goodsService.getGoodsConsultation(goodsId, query);
  }

  @Post('consultation/add')
  @ApiOperation({ summary: '添加商品咨询' })
  @ApiResponse({ status: 201, description: '添加成功' })
  async addGoodsConsultation(@Body() dto: AddConsultationDto) {
    return await this.goodsService.addGoodsConsultation(dto.goodsId, dto.content);
  }

  @Get('collection/list')
  @ApiOperation({ summary: '获取商品收藏列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getGoodsCollectionList(@Query() query: QueryGoodsDto) {
    return await this.goodsService.getGoodsCollectionList(query);
  }

  @Post('collection/add')
  @ApiOperation({ summary: '添加商品收藏' })
  @ApiResponse({ status: 201, description: '添加成功' })
  async addGoodsCollection(@Body() dto: AddCollectionDto) {
    return await this.goodsService.addGoodsCollection(dto.goodsId);
  }

  @Post('collection/cancel')
  @ApiOperation({ summary: '取消商品收藏' })
  @ApiResponse({ status: 200, description: '取消成功' })
  async cancelGoodsCollection(@Body() dto: AddCollectionDto) {
    return await this.goodsService.cancelGoodsCollection(dto.goodsId);
  }
}
