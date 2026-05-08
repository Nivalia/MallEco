# MallEco API 框架使用指南

## 概述

MallEco API 是一个基于 NestJS 的电商后端框架，提供了完整的标准化基础设施。

## 快速开始

### 1. 导入 SharedModule

在 `app.module.ts` 中导入全局共享模块:

```typescript
import { SharedModule } from '@shared/shared.module';

@Module({
  imports: [
    SharedModule, // 添加这一行
    // ...其他模块
  ],
})
export class AppModule {}
```

### 2. 使用 ErrorCode

```typescript
import { ErrorCode, getErrorMessage } from '@shared/exceptions';

// 在异常中使用
throw new HttpException(
  {
    code: ErrorCode.USR_NOT_FOUND,
    message: getErrorMessage(ErrorCode.USR_NOT_FOUND),
  },
  HttpStatus.BAD_REQUEST,
);
```

### 3. 使用装饰器

```typescript
import { Public, Roles, Permissions } from '@shared/decorators';

@Controller('users')
export class UserController {
  // 公开接口
  @Public()
  @Get('list')
  async list() {}

  // 需要角色
  @Roles('admin')
  @Get('admin')
  async admin() {}

  // 需要权限
  @Permissions('user:create')
  @Post()
  async create() {}
}
```

### 4. 使用 DTO

```typescript
import { PaginationDto, ListQueryDto, IdParamDto } from '@shared/dto/common.dto';

@Get('list')
async list(@Query() query: ListQueryDto) {
  // query.page, query.limit, query.orderBy, query.orderType, query.keyword
}

@Get(':id')
async detail(@Param() params: IdParamDto) { }
```

### 5. 使用实体基类

```typescript
import { BaseEntity, BaseTreeEntity, BaseSortableEntity } from '@common/entities/base.entity';

// 普通实体
@Entity()
export class User extends BaseEntity {}

// 树形实体 (分类等)
@Entity()
export class Category extends BaseTreeEntity {}

// 可排序实体
@Entity()
export class Banner extends BaseSortableEntity {}
```

### 6. 使用枚举

```typescript
import { OrderStatusEnum, PaymentStatusEnum, StatusEnum } from '@shared/enums';

// 订单状态
if (order.status === OrderStatusEnum.PENDING) {
}

// 状态启用/禁用
if (entity.status === StatusEnum.ENABLE) {
}
```

## 目录结构

```
src/
├── shared/                    # 共享基础设施
│   ├── decorators/            # 装饰器 (@Public, @Roles, @Permissions)
│   ├── dto/                  # DTO (分页、响应)
│   ├── exceptions/          # 错误码 (400+)
│   ├── guards/               # 守卫 (RolesGuard, PermissionsGuard)
│   ├── pipes/                # 管道 (ValidationPipe)
│   ├── interceptors/         # 拦截器
│   ├── filters/              # 过滤器
│   ├── services/             # 基础服务
│   ├── controllers/          # 基础控制器
│   ├── utils/                # 工具类
│   ├── enums/                # 通用枚举
│   └── shared.module.ts      # 全局模块
│
├── common/                   # 公共资源
│   └── entities/             # 实体基类
│
├── infrastructure/           # 基础设施实现
│   ├── auth/                # 认证授权
│   ├── cache/               # 缓存
│   └── ...
│
└── modules/                  # 业务模块
    ├── users/
    ├── goods/
    ├── orders/
    └── ...
```

## 错误码规范

| 范围      | 模块              |
| --------- | ----------------- |
| 000-099   | 通用错误 (GLO)    |
| 1000-1099 | 用户模块 (USR)    |
| 1100-1199 | 认证模块 (AUTH)   |
| 1200-1299 | 会员模块 (MEM)    |
| 1300-1399 | 订单模块 (ORD)    |
| 1400-1499 | 商品模块 (GDS)    |
| 1500-1599 | 购物车模块 (CART) |
| 1600-1699 | 支付模块 (PAY)    |
| ...       | ...               |

## 常用导入路径

```typescript
// 错误码
import { ErrorCode, getErrorMessage } from '@shared/exceptions';

// DTO
import { PaginationDto, ListQueryDto, DeleteDto } from '@shared/dto/common.dto';
import { ApiResponseDto, PaginatedResponseDto } from '@shared/dto/response.dto';

// 装饰器
import { Public, Roles, Permissions } from '@shared/decorators';

// 守卫
import { RolesGuard, PermissionsGuard, AdminGuard } from '@shared/guards';

// 管道
import { ValidationPipe } from '@shared/pipes';

// 实体
import { BaseEntity, BaseTreeEntity, BaseUuidEntity } from '@common/entities/base.entity';

// 枚举
import { StatusEnum, OrderStatusEnum, YesNoEnum } from '@shared/enums';

// 工具类
import { LoggerUtil } from '@shared/utils/logger.util';
import { ResultUtil } from '@shared/utils/result.util';
```
