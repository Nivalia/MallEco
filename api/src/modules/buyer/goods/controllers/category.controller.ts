import { Controller, Get, Param } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('商品分类')
@Controller('buyer/goods/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  list() {
    const categories = this.categoryService.listAllChildren('0');
    return {
      success: true,
      result: categories,
    };
  }

  @Get(':parentId')
  listByParentId(@Param('parentId') parentId: string) {
    const categories = this.categoryService.listAllChildren(parentId);
    return {
      success: true,
      result: categories,
    };
  }

  @Get('get/:parentId')
  listOld(@Param('parentId') parentId: string) {
    const categories = this.categoryService.listAllChildren(parentId);
    return {
      success: true,
      result: categories,
    };
  }
}
