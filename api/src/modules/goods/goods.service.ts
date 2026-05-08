import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In, FindOptionsWhere } from 'typeorm';
import { CacheProtectionService } from '../../infrastructure/cache/cache-protection.service';
import { Goods } from './entities/goods.entity';
import { GoodsSku } from './entities/goods-sku.entity';
import { GoodsCategory } from './entities/goods-category.entity';
import { ErrorCode, getErrorMessage } from '../../shared/exceptions/error-code';
import { CreateGoodsDto, UpdateGoodsDto, QueryGoodsDto } from './dto';
import { PaginatedResponse, PaginatedResponseDto } from '../../shared/dto/response.dto';

@Injectable()
export class GoodsService {
  private readonly logger = new Logger(GoodsService.name);

  constructor(
    @InjectRepository(Goods)
    private readonly goodsRepository: Repository<Goods>,
    @InjectRepository(GoodsSku)
    private readonly goodsSkuRepository: Repository<GoodsSku>,
    @InjectRepository(GoodsCategory)
    private readonly goodsCategoryRepository: Repository<GoodsCategory>,
    private readonly cacheProtectionService: CacheProtectionService,
  ) {}

  async create(createDto: CreateGoodsDto): Promise<Goods> {
    const existGoods = await this.goodsRepository.findOne({
      where: { goodsSn: createDto.goodsSn },
    });

    if (existGoods) {
      throw new ConflictException({
        code: ErrorCode.GDS_ALREADY_EXISTS,
        message: '商品编号已存在',
      });
    }

    const goods = this.goodsRepository.create(createDto);
    const result = await this.goodsRepository.save(goods);

    this.logger.log(`商品创建成功: ${result.id}`, 'GoodsService');

    return result;
  }

  async findAll(query: QueryGoodsDto): Promise<PaginatedResponse<Goods>> {
    const {
      page = 1,
      limit = 10,
      keyword,
      categoryId,
      brandId,
      isOnSale,
      isNew,
      isHot,
      orderBy = 'createdAt',
      orderType = 'DESC',
      minPrice,
      maxPrice,
    } = query;

    const where: FindOptionsWhere<Goods> = { isDelete: 0 };

    if (isOnSale !== undefined) where.isOnSale = isOnSale;
    if (isNew !== undefined) where.isNew = isNew;
    if (isHot !== undefined) where.isHot = isHot;
    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;

    let goodsRepo: [Goods[], number];
    if (keyword) {
      goodsRepo = await this.goodsRepository.findAndCount({
        where: [
          { ...where, goodsName: Like(`%${keyword}%`) },
          { ...where, keywords: Like(`%${keyword}%`) },
        ],
        order: { [orderBy]: orderType },
        skip: (page - 1) * limit,
        take: limit,
      });
    } else {
      goodsRepo = await this.goodsRepository.findAndCount({
        where,
        order: { [orderBy]: orderType },
        skip: (page - 1) * limit,
        take: limit,
      });
    }

    return PaginatedResponseDto.create(
      goodsRepo[0],
      goodsRepo[1],
      page,
      limit,
    );
  }

  async findById(goodsId: string): Promise<Goods> {
    const goods = await this.goodsRepository.findOne({
      where: { id: goodsId, isDelete: 0 },
    });

    if (!goods) {
      throw new NotFoundException({
        code: ErrorCode.GDS_NOT_FOUND,
        message: getErrorMessage(ErrorCode.GDS_NOT_FOUND),
      });
    }

    return goods;
  }

  async getGoodsDetail(goodsId: string) {
    const cacheKey = `goods:detail:${goodsId}`;

    return await this.cacheProtectionService.getWithPenetrationProtection(
      cacheKey,
      async () => {
        const goods = await this.findById(goodsId);

        return {
          goodsId: goods.id,
          name: goods.goodsName,
          price: goods.shopPrice,
          stock: goods.stock,
          description: goods.goodsDesc,
        };
      },
      3600,
    );
  }

  async getGoodsList(query: QueryGoodsDto) {
    const { page = 1, limit = 10, categoryId } = query;
    const cacheKey = `goods:list:${page}:${limit}:${categoryId || 'all'}`;

    return await this.cacheProtectionService.getWithPenetrationProtection(
      cacheKey,
      async () => {
        const where: FindOptionsWhere<Goods> = { isDelete: 0, isOnSale: 1 };
        if (categoryId) where.categoryId = categoryId;

        const result = await this.goodsRepository.findAndCount({
          where,
          order: { createdAt: 'DESC' },
          skip: (page - 1) * limit,
          take: limit,
        });

        return PaginatedResponseDto.create(result[0], result[1], page, limit);
      },
      1800,
    );
  }

  async getCategoryList() {
    const cacheKey = 'goods:categories';

    return await this.cacheProtectionService.getWithPenetrationProtection(
      cacheKey,
      async () => {
        const categories = await this.goodsCategoryRepository.find({
          where: { isDelete: 0, isShow: 1 },
          order: { sortOrder: 'ASC' },
        });

        return { list: categories, total: categories.length };
      },
      7200,
    );
  }

  async getSkuList(goodsId: string) {
    const cacheKey = `goods:sku:${goodsId}`;

    return await this.cacheProtectionService.getWithPenetrationProtection(
      cacheKey,
      async () => {
        await this.findById(goodsId);

        const skus = await this.goodsSkuRepository.find({
          where: { goodsId, isDelete: 0 },
        });

        return { goodsId, skuList: skus };
      },
      3600,
    );
  }

  async searchGoods(query: QueryGoodsDto) {
    const { page = 1, limit = 10, keyword } = query;

    const where: FindOptionsWhere<Goods>[] = [{ isDelete: 0, isOnSale: 1 }];

    if (keyword) {
      where.push({ goodsName: Like(`%${keyword}%`) }, { keywords: Like(`%${keyword}%`) });
    }

    const result = await this.goodsRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return PaginatedResponseDto.create(result[0], result[1], page, limit);
  }

  async update(goodsId: string, updateDto: UpdateGoodsDto): Promise<Goods> {
    const goods = await this.findById(goodsId);

    if (updateDto.goodsSn && updateDto.goodsSn !== goods.goodsSn) {
      const existGoods = await this.goodsRepository.findOne({
        where: { goodsSn: updateDto.goodsSn },
      });
      if (existGoods) {
        throw new ConflictException({
          code: ErrorCode.GDS_ALREADY_EXISTS,
          message: '商品编号已存在',
        });
      }
    }

    Object.assign(goods, updateDto);

    const result = await this.goodsRepository.save(goods);

    await this.cacheProtectionService.delete(`goods:detail:${goodsId}`);

    this.logger.log(`商品更新成功: ${goodsId}`, 'GoodsService');

    return result;
  }

  async delete(goodsId: string): Promise<void> {
    const goods = await this.findById(goodsId);

    goods.isDelete = 1;
    await this.goodsRepository.save(goods);

    await this.cacheProtectionService.delete(`goods:detail:${goodsId}`);

    this.logger.log(`商品删除成功: ${goodsId}`, 'GoodsService');
  }

  async checkGoodsStock(goodsId: string, quantity: number): Promise<boolean> {
    const goods = await this.goodsRepository.findOne({
      where: { id: goodsId, isDelete: 0, isOnSale: 1 },
    });

    if (!goods) {
      throw new NotFoundException({
        code: ErrorCode.GDS_NOT_FOUND,
        message: getErrorMessage(ErrorCode.GDS_NOT_FOUND),
      });
    }

    if (goods.stock < quantity) {
      throw new BadRequestException({
        code: ErrorCode.GDS_STOCK_INSUFFICIENT,
        message: getErrorMessage(ErrorCode.GDS_STOCK_INSUFFICIENT),
      });
    }

    return true;
  }

  async deductGoodsStock(goodsId: string, quantity: number): Promise<Goods> {
    const goods = await this.findById(goodsId);

    if (!goods || goods.stock < quantity) {
      throw new BadRequestException({
        code: ErrorCode.GDS_STOCK_INSUFFICIENT,
        message: getErrorMessage(ErrorCode.GDS_STOCK_INSUFFICIENT),
      });
    }

    goods.stock -= quantity;
    const result = await this.goodsRepository.save(goods);

    await this.cacheProtectionService.delete(`goods:detail:${goodsId}`);

    this.logger.log(`商品库存扣减成功: ${goodsId}, 数量: ${quantity}`, 'GoodsService');

    return result;
  }

  async restoreGoodsStock(goodsId: string, quantity: number): Promise<Goods> {
    const goods = await this.findById(goodsId);

    if (!goods) {
      throw new NotFoundException({
        code: ErrorCode.GDS_NOT_FOUND,
        message: getErrorMessage(ErrorCode.GDS_NOT_FOUND),
      });
    }

    goods.stock += quantity;
    const result = await this.goodsRepository.save(goods);

    await this.cacheProtectionService.delete(`goods:detail:${goodsId}`);

    this.logger.log(`商品库存恢复成功: ${goodsId}, 数量: ${quantity}`, 'GoodsService');

    return result;
  }

  async getGoodsEvaluation(goodsId: string, query: QueryGoodsDto) {
    await this.findById(goodsId);

    return {
      goodsId,
      evaluationList: [],
      total: 0,
      page: query.page || 1,
      size: query.limit || 10,
    };
  }

  async getGoodsConsultation(goodsId: string, query: QueryGoodsDto) {
    await this.findById(goodsId);

    return {
      goodsId,
      consultationList: [],
      total: 0,
      page: query.page || 1,
      size: query.limit || 10,
    };
  }

  async addGoodsConsultation(goodsId: string, content: string) {
    await this.findById(goodsId);

    this.logger.log(`商品咨询添加成功: ${goodsId}`, 'GoodsService');

    return { goodsId, content, consultationId: Date.now().toString() };
  }

  async getGoodsCollectionList(query: QueryGoodsDto) {
    return {
      list: [],
      total: 0,
      page: query.page || 1,
      size: query.limit || 10,
    };
  }

  async addGoodsCollection(goodsId: string) {
    await this.findById(goodsId);

    this.logger.log(`商品收藏添加成功: ${goodsId}`, 'GoodsService');

    return { goodsId, collectionId: Date.now().toString() };
  }

  async cancelGoodsCollection(goodsId: string) {
    await this.findById(goodsId);

    this.logger.log(`商品收藏取消成功: ${goodsId}`, 'GoodsService');

    return { goodsId };
  }
}
