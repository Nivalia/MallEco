import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GoodsFullService } from '../services/goods-full.service';
import {
  GoodsQuery,
  GoodsData,
  CategoryQuery,
  CategoryData,
  BrandQuery,
  BrandData,
  SpecQuery,
  SpecData,
  LabelData,
  ParamsQuery,
  ParamsData,
  StockExportQuery,
  StockImportData,
} from '../services/goods-full.service';
import { PaginationDto } from '../../../shared/dto';

@ApiTags('商品')
@Controller('goods')
export class GoodsFullController {
  constructor(private readonly goodsFullService: GoodsFullService) {}

  // 商品相关接口
  @Get('goods/list')
  async getGoodsList(@Query() query: PaginationDto) {
    return await this.goodsFullService.getGoodsList(query);
  }

  @Get('goods/sku/list')
  async getGoodsSkuList(@Query() query: PaginationDto) {
    return await this.goodsFullService.getGoodsSkuList(query);
  }

  @Get('goods/get/:id')
  async getGoods(@Param('id') id: string) {
    return await this.goodsFullService.getGoods(id);
  }

  @Post('goods/create')
  async createGoods(@Body() goodsData: GoodsData) {
    return await this.goodsFullService.createGoods(goodsData);
  }

  @Put('goods/update/:id')
  async updateGoods(@Param('id') id: string, @Body() goodsData: GoodsData) {
    return await this.goodsFullService.updateGoods(id, goodsData);
  }

  @Put('goods/up')
  async upGoods(@Body() goodsData: GoodsData) {
    return await this.goodsFullService.upGoods(goodsData);
  }

  @Put('goods/under')
  async lowGoods(@Body() goodsData: GoodsData) {
    return await this.goodsFullService.lowGoods(goodsData);
  }

  // 分类相关接口
  @Get('category/all')
  async getGoodsCategoryAll() {
    return await this.goodsFullService.getGoodsCategoryAll();
  }

  @Get('category/:id/children')
  async getGoodsCategoryLevelList(@Param('id') id: string, @Query() query: CategoryQuery) {
    return await this.goodsFullService.getGoodsCategoryLevelList(id, query);
  }

  @Post('category/insertCategory')
  async insertCategory(@Body() categoryData: CategoryData) {
    return await this.goodsFullService.insertCategory(categoryData);
  }

  @Post('category/updateCategory')
  async updateCategory(@Body() categoryData: CategoryData) {
    return await this.goodsFullService.updateCategory(categoryData);
  }

  @Delete('category/del/:id')
  async delCategory(@Param('id') id: string) {
    return await this.goodsFullService.delCategory(id);
  }

  // 品牌相关接口
  @Get('brand/getByPage')
  async getBrandList(@Query() query: BrandQuery) {
    return await this.goodsFullService.getBrandList(query);
  }

  @Post('brand/insertOrUpdate')
  async insertOrUpdateBrand(@Body() brandData: BrandData) {
    return await this.goodsFullService.insertOrUpdateBrand(brandData);
  }

  // 规格相关接口
  @Get('spec/list')
  async getSpecList(@Query() query: SpecQuery) {
    return await this.goodsFullService.getSpecList(query);
  }

  @Post('spec/edit')
  async insertOrUpdateSpec(@Body() specData: SpecData) {
    return await this.goodsFullService.insertOrUpdateSpec(specData);
  }

  // 标签相关接口
  @Get('label')
  async getShopGoodsLabelList() {
    return await this.goodsFullService.getShopGoodsLabelList();
  }

  @Post('label')
  async addShopGoodsLabel(@Body() labelData: LabelData) {
    return await this.goodsFullService.addShopGoodsLabel(labelData);
  }

  @Put('label')
  async editShopGoodsLabel(@Body() labelData: LabelData) {
    return await this.goodsFullService.editShopGoodsLabel(labelData);
  }

  @Delete('label/:id')
  async delShopGoodsLabel(@Param('id') id: string) {
    return await this.goodsFullService.delShopGoodsLabel(id);
  }

  // 参数相关接口
  @Get('categoryParameters/:id')
  async getCategoryParamsList(@Param('id') id: string, @Query() query: ParamsQuery) {
    return await this.goodsFullService.getCategoryParamsList(id, query);
  }

  @Post('parameters/save')
  async insertOrUpdateParams(@Body() paramsData: ParamsData) {
    return await this.goodsFullService.insertOrUpdateParams(paramsData);
  }

  // 导入导出接口
  @Get('goods/queryExportStock')
  async queryExportStock(@Query() query: StockExportQuery) {
    return await this.goodsFullService.queryExportStock(query);
  }

  @Post('goods/importStockExcel')
  async importStockExcel(@Body() importData: StockImportData) {
    return await this.goodsFullService.importStockExcel(importData);
  }
}
