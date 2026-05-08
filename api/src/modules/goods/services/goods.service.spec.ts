import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goods } from '../entities/goods.entity';
import { GoodsService } from '../goods.service';
import { CacheProtectionService } from '../../../infrastructure/cache/cache-protection.service';

describe('GoodsService', () => {
  let goodsService: GoodsService;
  let goodsRepository: jest.Mocked<Repository<Goods>>;
  let cacheProtectionService: jest.Mocked<CacheProtectionService>;

  const mockGoods = {
    id: '1',
    goodsName: '测试商品',
    goodsSn: 'TEST001',
    categoryId: '1',
    brandId: '1',
    goodsWeight: 1,
    keywords: '测试,商品',
    goodsDesc: '<p>测试商品详情</p>',
    isOnSale: 1,
    isDelete: 0,
    isNew: 0,
    isHot: 0,
    goodsImg: 'http://example.com/test.jpg',
    goodsGallery: ['http://example.com/test1.jpg', 'http://example.com/test2.jpg'],
    stock: 100,
    marketPrice: 100,
    shopPrice: 80,
    salesNum: 0,
    clickNum: 0,
    createTime: new Date(),
    updateTime: new Date(),
    isDel: 0,
    skuList: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as unknown as Goods;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoodsService,
        {
          provide: getRepositoryToken(Goods),
          useValue: {
            find: jest.fn() as (this: void, ...args: any[]) => Promise<Goods[]>,
            findOne: jest.fn() as (this: void, ...args: any[]) => Promise<Goods | undefined>,
            create: jest.fn() as (this: void, ...args: any[]) => Goods,
            save: jest.fn() as (this: void, ...args: any[]) => Promise<Goods>,
            update: jest.fn() as (this: void, ...args: any[]) => Promise<any>,
            delete: jest.fn() as (this: void, ...args: any[]) => Promise<any>,
          },
        },
        {
          provide: CacheProtectionService,
          useValue: {
            get: jest.fn() as (this: void, ...args: any[]) => Promise<any>,
            set: jest.fn() as (this: void, ...args: any[]) => Promise<void>,
            delete: jest.fn() as (this: void, ...args: any[]) => Promise<void>,
          },
        },
      ],
    }).compile();

    goodsService = module.get<GoodsService>(GoodsService);
    goodsRepository = module.get(getRepositoryToken(Goods));
    cacheProtectionService = module.get(CacheProtectionService);
  });

  describe('checkGoodsStock', () => {
    it('应该返回true，当商品库存充足时', async () => {
      // Arrange
      goodsRepository.findOne.mockResolvedValue(mockGoods);

      // Act
      const result = await goodsService.checkGoodsStock('1', 50);

      // Assert
      expect(result).toBe(true);
      expect(goodsRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('应该返回false，当商品库存不足时', async () => {
      // Arrange
      const lowStockGoods = { ...mockGoods, stock: 30 };
      goodsRepository.findOne.mockResolvedValue(lowStockGoods);

      // Act
      const result = await goodsService.checkGoodsStock('1', 50);

      // Assert
      expect(result).toBe(false);
    });

    it('应该返回false，当商品不存在时', async () => {
      // Arrange
      goodsRepository.findOne.mockResolvedValue(undefined);

      // Act
      const result = await goodsService.checkGoodsStock('999', 10);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('deductGoodsStock', () => {
    it('应该成功扣减商品库存，当库存充足时', async () => {
      // Arrange
      goodsRepository.findOne.mockResolvedValue(mockGoods);
      goodsRepository.save.mockResolvedValue({ ...mockGoods, stock: 50 });

      // Act
      await goodsService.deductGoodsStock('1', 50);

      // Assert
      expect(goodsRepository.save).toHaveBeenCalledWith({ ...mockGoods, stock: 50 });
      expect(cacheProtectionService.delete).toHaveBeenCalledWith(`goods:${mockGoods.id}`);
    });

    it('应该抛出BadRequestException，当商品库存不足时', async () => {
      // Arrange
      const lowStockGoods = { ...mockGoods, stock: 30 };
      goodsRepository.findOne.mockResolvedValue(lowStockGoods);

      // Act & Assert
      await expect(goodsService.deductGoodsStock('1', 50)).rejects.toThrow(BadRequestException);
      await expect(goodsService.deductGoodsStock('1', 50)).rejects.toThrow('商品库存不足');
    });

    it('应该抛出BadRequestException，当商品不存在时', async () => {
      // Arrange
      goodsRepository.findOne.mockResolvedValue(undefined);

      // Act & Assert
      await expect(goodsService.deductGoodsStock('999', 10)).rejects.toThrow(BadRequestException);
      await expect(goodsService.deductGoodsStock('999', 10)).rejects.toThrow('商品不存在');
    });
  });

  describe('restoreGoodsStock', () => {
    it('应该成功恢复商品库存', async () => {
      // Arrange
      goodsRepository.findOne.mockResolvedValue(mockGoods);
      goodsRepository.save.mockResolvedValue({ ...mockGoods, stock: 150 });

      // Act
      await goodsService.restoreGoodsStock('1', 50);

      // Assert
      expect(goodsRepository.save).toHaveBeenCalledWith({ ...mockGoods, stock: 150 });
      expect(cacheProtectionService.delete).toHaveBeenCalledWith(`goods:${mockGoods.id}`);
    });

    it('应该抛出BadRequestException，当商品不存在时', async () => {
      // Arrange
      goodsRepository.findOne.mockResolvedValue(undefined);

      // Act & Assert
      await expect(goodsService.restoreGoodsStock('999', 10)).rejects.toThrow(BadRequestException);
      await expect(goodsService.restoreGoodsStock('999', 10)).rejects.toThrow('商品不存在');
    });
  });
});
