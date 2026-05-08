# MallEco API - 企业级电商平台后端系统

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11.x-red" alt="NestJS">
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-20+-green" alt="Node.js">
  <img src="https://img.shields.io/badge/Docker-20.10+-blue" alt="Docker">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

## 项目简介

MallEco API 是一个基于 NestJS 框架构建的企业级 B2B2C 电商平台后端系统，采用 TypeScript 开发，支持高并发、高可用的生产环境部署。系统集成了完整的电商业务功能，包括商品管理、订单处理、支付系统、用户管理、营销推广等核心模块。

本项目经过深度优化，构建了一套完整的标准化基础设施，包括错误码体系、验证管道、装饰器系统、审计日志、国际化支持、分布式锁、幂等性控制等企业级特性。

---

## 核心优势

### 1. 标准化基础设施

- **统一错误码体系**：400+ 错误码，覆盖所有业务场景，统一错误响应格式
- **规范化 DTO**：标准化的数据传输对象，包含分页、排序、列表查询等常用 DTO
- **统一响应格式**：标准化的 API 响应结构，支持分页、列表、详情等响应类型
- **完整校验管道**：基于 class-validator 的全局验证管道，支持自定义装饰器

### 2. 安全性保障

- **JWT 无状态认证**：完整的身份认证和授权体系
- **RBAC 权限控制**：基于角色的访问控制，支持细粒度权限管理
- **数据脱敏**：敏感信息自动脱敏，支持手机号、身份证、银行卡等
- **分布式锁**：基于 Redis 的分布式锁，防止并发冲突
- **幂等性控制**：接口幂等处理，防止重复提交
- **审计日志**：完整的操作日志记录，支持查询统计

### 3. 扩展性设计

- **模块化架构**：业务模块完全解耦，支持灵活扩展
- **基类复用**：BaseService、BaseController 提供通用 CRUD 功能
- **多存储支持**：文件存储抽象，支持本地、OSS、COS、S3 等
- **多消息队列**：消息发布订阅，支持订单、支付、库存等业务消息
- **GraphQL 支持**：可选的 GraphQL 支持，灵活查询
- **WebSocket 支持**：实时通信，支持消息推送、订单状态通知

### 4. 可维护性

- **国际化支持**：多语言支持 (简体中文、繁体中文、英文、日文)
- **完善的文档**：完整的 API 使用指南、规范化文档
- **代码规范**：统一的代码风格和命名规范
- **测试工具**：完整的单元测试和集成测试支持
- **缓存策略**：预定义的缓存策略配置

### 5. 性能优化

- **多级缓存**：Redis 缓存策略，减少数据库压力
- **连接池管理**：数据库连接池优化
- **查询优化**：QueryBuilder 工具，支持复杂查询
- **性能监控**：完整的性能监控和慢查询分析
- **限流熔断**：API 限流和熔断保护

---

## 系统架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              客户端层                                    │
│                   (Web、移动端、小程序、第三方系统)                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                             API 网关层                                   │
│                        (Nginx + 负载均衡)                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                             应用服务层                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │ 认证模块  │  │ 业务模块  │  │ 基础设施  │  │ 共享模块  │               │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌──────────┐   ┌──────────┐   ┌──────────┐
            │  MySQL   │   │  Redis   │   │ RabbitMQ │
            └──────────┘   └──────────┘   └──────────┘
```

### 目录结构

```
src/
├── main.ts                      # 应用入口
├── app.module.ts                # 根模块
│
├── common/                      # 公共资源
│   └── entities/                # 实体基类
│
├── infrastructure/              # 基础设施层
│   ├── auth/                    # 认证授权
│   ├── cache/                   # 缓存服务
│   ├── redis/                   # Redis 服务
│   ├── rabbitmq/                # 消息队列
│   ├── search/                  # 搜索服务
│   ├── monitoring/              # 监控系统
│   └── health/                  # 健康检查
│
├── modules/                     # 业务模块 (40+)
│   ├── users/                  # 用户模块
│   ├── goods/                 # 商品模块
│   ├── orders/                # 订单模块
│   ├── cart/                  # 购物车模块
│   ├── payment/                # 支付模块
│   ├── distribution/          # 分销模块
│   ├── promotion/              # 促销模块
│   ├── live/                  # 直播模块
│   ├── wechat/                # 微信模块
│   ├── insurance/             # 保险模块
│   └── ...                    # 更多模块
│
└── shared/                    # 共享基础设施 ⭐
    ├── decorators/            # 装饰器集合
    │   ├── auth.decorator.ts  # @Public, @SkipAuth
    │   ├── rbac.decorator.ts    # @Roles, @Permissions
    │   ├── version.decorator.ts # @ApiVersion
    │   └── ...
    │
    ├── dto/                     # 数据传输对象
    │   ├── common.dto.ts        # 分页、排序、列表查询
    │   └── response.dto.ts      # 响应格式
    │
    ├── exceptions/              # 异常处理
    │   ├── error-code.ts        # 400+ 错误码
    │   └── business.exception.ts # 业务异常
    │
    ├── guards/                  # 权限守卫
    │   └── index.ts             # RolesGuard, PermissionsGuard
    │
    ├── pipes/                   # 验证管道
    │   └── validation.pipe.ts   # 全局验证
    │
    ├── interceptors/             # 拦截器
    │   ├── response.interceptor.ts
    │   └── performance.interceptor.ts
    │
    ├── filters/                  # 异常过滤器
    │   └── global-exception.filter.ts
    │
    ├── services/                 # 基础服务
    │   ├── base.service.ts      # 通用 CRUD
    │   └── enhanced-base.service.ts
    │
    ├── controllers/              # 基础控制器
    │   └── base.controller.ts
    │
    ├── utils/                    # 工具类
    │   ├── logger.util.ts       # 日志工具
    │   ├── result.util.ts       # 结果封装
    │   ├── query-builder.util.ts # 查询构建
    │   ├── migration.util.ts    # 迁移工具
    │   ├── cache-strategy.util.ts # 缓存策略
    │   └── testing.util.ts      # 测试工具
    │
    ├── enums/                    # 枚举定义
    │   └── index.ts              # 状态、订单、支付等枚举
    │
    ├── i18n/                     # 国际化 ⭐
    │   ├── i18n.config.ts
    │   ├── i18n.service.ts
    │   └── i18n.decorator.ts
    │
    ├── audit/                    # 审计日志 ⭐
    │   ├── audit-log.entity.ts
    │   └── audit.service.ts
    │
    ├── lock/                     # 分布式锁 ⭐
    │   ├── lock.config.ts
    │   └── lock.service.ts
    │
    ├── idempotency/              # 幂等性 ⭐
    │   ├── idempotency.config.ts
    │   └── idempotency.service.ts
    │
    ├── storage/                  # 文件存储 ⭐
    │   ├── storage.config.ts
    │   └── storage.service.ts
    │
    ├── mq/                       # 消息队列 ⭐
    │   ├── mq.config.ts
    │   └── mq.service.ts
    │
    ├── websocket/                # WebSocket ⭐
    │   ├── websocket.config.ts
    │   └── websocket.gateway.ts
    │
    ├── graphql/                  # GraphQL ⭐
    │   ├── graphql.config.ts
    │   └── graphql.types.ts
    │
    └── security/                 # 安全相关
        ├── desensitize.service.ts # 数据脱敏
        ├── rate-limiter.service.ts # 限流
        └── circuit-breaker.service.ts # 熔断
```

### 项目根目录结构

```
MallEco/
├── src/                      # 源代码目录 (NestJS 后端)
│   ├── main.ts              # 应用入口
│   ├── app.module.ts        # 根模块
│   ├── common/              # 公共资源
│   ├── infrastructure/       # 基础设施层
│   ├── modules/              # 业务模块 (40+)
│   └── shared/               # 共享基础设施
│
├── public/                   # 静态资源目录
│   ├── index.html          # 静态入口页面
│   ├── logo.png            # Logo 图片
│   └── slider/             # 轮播图资源
│
├── resources/               # 业务资源目录
│   └── slider/            # 轮播图等
│
├── nginx/                   # Nginx 配置目录
│   ├── nginx.conf         # 主配置文件
│   └── html/              # Nginx HTML 文件
│
├── config/                 # 配置文件目录
│   ├── .env               # 环境变量配置
│   ├── .env.example      # 环境变量模板
│   ├── wechatpay/        # 微信支付配置
│   └── cdn/              # CDN 配置文件 ⭐新增
│
├── scripts/                 # 脚本工具目录
│   ├── init-menu.js       # 菜单初始化脚本
│   ├── database-init.js   # 数据库初始化脚本
│   ├── create-wechat-entities.ts  # 微信实体生成
│   └── *.ts              # TypeScript 脚本
│
├── docs/                    # 项目文档目录
│   ├── CDN配置指南.md     # CDN 配置文档
│   └── ...                # 其他文档
│
├── test/                    # 测试文件目录
├── backup/                  # 备份文件目录
├── backups/                # 备份存储目录
├── uploads/                # 上传文件目录
├── logs/                   # 日志文件目录
├── monitoring/             # 监控配置目录
├── performance-tests/      # 性能测试目录
│
├── docker-compose.yml      # Docker Compose 开发配置
├── docker-compose.prod.yml # Docker Compose 生产配置
├── Dockerfile             # Docker 镜像配置
├── Dockerfile.prod        # 生产环境 Docker 配置
│
├── package.json           # npm 依赖配置
├── package-lock.json      # npm 锁定文件
├── tsconfig.json          # TypeScript 配置
├── tsconfig.build.json    # TypeScript 构建配置
├── nest-cli.json          # NestJS CLI 配置
├── jest.config.js         # Jest 测试配置
│
└── README.md              # 项目说明文档
```

### 核心配置文件说明

| 文件/目录                | 说明           |
| -------------------- | ------------ |
| `config/.env`        | 环境变量配置       |
| `nginx/nginx.conf`   | Nginx 反向代理配置 |
| `docker-compose.yml` | Docker 容器编排  |
| `docs/CDN配置指南.md`    | CDN 配置文档     |

---

## 技术栈

### 后端技术

| 技术         | 版本    | 说明            |
| ---------- | ----- | ------------- |
| NestJS     | 11.x  | Node.js 企业级框架 |
| TypeScript | 5.x   | 类型安全          |
| MySQL      | 8.0+  | 主数据库          |
| Redis      | 7.0+  | 缓存、会话、分布式锁    |
| RabbitMQ   | 3.11+ | 消息队列          |
| Consul     | 1.16+ | 服务发现          |

### 安全技术

| 技术            | 说明        |
| ------------- | --------- |
| JWT           | 无状态身份认证   |
| RBAC          | 基于角色的权限控制 |
| BCrypt        | 密码加密      |
| Helmet        | HTTP 安全头部 |
| Rate Limiting | API 限流    |

### 支付集成

| 渠道   | 说明      |
| ---- | ------- |
| 支付宝  | 支付宝支付接口 |
| 微信支付 | 微信支付接口  |

### 云服务

| 服务      | 说明    |
| ------- | ----- |
| 阿里云 SMS | 短信服务  |
| 腾讯云     | 云服务集成 |

### 前端/客户端集成

项目提供多种客户端集成方式：

| 集成方式      | 说明             | 适用场景        |
| --------- | -------------- | ----------- |
| REST API  | 标准 RESTful API | Web、移动端、小程序 |
| GraphQL   | 灵活查询 (可选)      | 需要复杂数据聚合的场景 |
| WebSocket | 实时通信           | 消息推送、直播、客服  |

### 前后端分离架构

本项目采用前后端完全分离的架构设计：

```
┌─────────────────┐         ┌─────────────────┐
│   Web 前端       │         │   移动端 APP    │
│  (Vue/React)    │         │ (iOS/Android)  │
└────────┬────────┘         └────────┬────────┘
         │                           │
         └───────────┬─────────────┘
                     │
                     ▼
         ┌─────────────────────┐
         │    Nginx 负载均衡    │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │   MallEco API 后端    │
         │     (NestJS)        │
         └──────────┬──────────┘
                    │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
┌────────┐   ┌────────┐   ┌────────┐
│ MySQL  │   │ Redis  │   │RabbitMQ│
└────────┘   └────────┘   └────────┘
```

### 前端技术选型建议

项目可配合以下前端框架使用：

| 前端框架   | 说明                | 适用场景       |
| ------ | ----------------- | ---------- |
| Vue 3  | 渐进式 JavaScript 框架 | 电商网站、管理后台  |
| React  | 组件化 UI 库          | 复杂交互应用     |
| Uniapp | Vue 开发多端          | 小程序、H5、App |
| Taro   | React 开发多端        | 微信/支付宝小程序  |

### 静态文件服务

项目内置静态文件服务，支持：

- 静态资源托管 (图片、视频、文档)
- 文件上传/下载
- 静态页面托管

```
public/
├── index.html      # 静态入口页面
├── logo.png       # 静态图片资源
└── slider/        # 轮播图资源
```

访问根路径 `/` 返回静态入口页面，API 请求自动路由到 `/api/*`。

### API 端点结构

项目采用模块化的 API 端点结构，按业务角色划分：

| 前缀               | 说明   | 认证方式     |
| ---------------- | ---- | -------- |
| `/api/auth/*`    | 认证接口 | 公开       |
| `/api/common/*`  | 通用接口 | 公开       |
| `/api/buyer/*`   | 买家接口 | JWT      |
| `/api/seller/*`  | 商家接口 | JWT + 角色 |
| `/api/manager/*` | 管理后台 | JWT + 角色 |
| `/api/wechat/*`  | 微信接口 | Token    |

### 客户端接入示例

**Web 前端 (Vue/React/Angular)**

```javascript
// 使用 axios 或 fetch
const response = await fetch('/api/goods/list', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

**移动端 (iOS/Android)**

```swift
// iOS (Swift)
let url = URL(string: "https://api.example.com/api/orders")!
var request = URLRequest(url: url)
request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
```

**小程序 (微信/支付宝)**

```javascript
// 微信小程序
wx.request({
  url: 'https://api.example.com/api/goods/detail/1',
  header: {
    Authorization: 'Bearer ' + token,
  },
});
```

---

## 核心模块功能

### 1. 用户模块

- 多角色用户体系 (买家、卖家、管理员)
- 用户注册和认证
- RBAC 权限控制
- 用户等级和积分系统

### 2. 商品模块

- 商品 CRUD 操作
- 分类和品牌管理
- 库存管理和预警
- SKU 规格管理
- 商品搜索和推荐

### 3. 订单模块

- 订单创建和状态管理
- 订单分表存储
- 购物车管理
- 退款和售后处理

### 4. 支付模块

- 多渠道支付 (支付宝、微信)
- 支付回调处理
- 退款处理

### 5. 营销模块

- 优惠券管理
- 满减活动
- 限时折扣
- 分销系统

### 6. 直播模块

- 直播间管理
- 直播带货
- 实时互动

### 7. 保险台账模块

- 保单管理
- 保险公司管理
- 渠道商管理
- 结算管理

---

## 开发规范

### 1. 错误码规范

项目采用统一的错误码体系，便于问题定位和国际化处理：

| 范围        | 模块           |
| --------- | ------------ |
| 000-099   | 通用错误 (GLO)   |
| 1000-1099 | 用户模块 (USR)   |
| 1100-1199 | 认证模块 (AUTH)  |
| 1200-1299 | 会员模块 (MEM)   |
| 1300-1399 | 订单模块 (ORD)   |
| 1400-1499 | 商品模块 (GDS)   |
| 1500-1599 | 购物车模块 (CART) |
| 1600-1699 | 支付模块 (PAY)   |
| ...       | 更多模块         |

### 2. 实体基类规范

项目提供多种实体基类，适应不同业务场景：

```typescript
// 普通实体 - 通用场景
class User extends BaseEntity {}

// 树形实体 - 分类、组织等层级结构
class Category extends BaseTreeEntity {}

// 可排序实体 - 需要排序的实体
class Banner extends BaseSortableEntity {}

// UUID 实体 - 分布式场景
class Session extends BaseUuidEntity {}
```

### 3. DTO 规范

所有请求 DTO 必须继承或使用通用 DTO：

```typescript
// 分页查询
class QueryGoodsDto extends ListQueryDto {}

// 创建 DTO
class CreateGoodsDto {}

// 更新 DTO
class UpdateGoodsDto {}
```

### 4. 装饰器使用规范

| 装饰器          | 说明    | 示例                          |
| ------------ | ----- | --------------------------- |
| @Public      | 公开接口  | @Public()                   |
| @Roles       | 角色权限  | @Roles('admin')             |
| @Permissions | 细粒度权限 | @Permissions('user:create') |
| @ApiVersion  | API版本 | @ApiVersion('v1')           |
| @I18n        | 国际化   | @I18n('zh-CN')              |

---

## 部署指南

### 1. 环境要求

| 组件       | 最低版本   | 推荐版本     |
| -------- | ------ | -------- |
| Node.js  | 20.0.0 | 20.x LTS |
| MySQL    | 8.0    | 8.0+     |
| Redis    | 7.0    | 7.0+     |
| RabbitMQ | 3.11   | 3.12+    |
| Docker   | 20.10  | 24.x     |

### 2. Docker 部署

```bash
# 克隆项目
git clone https://github.com/your-repo/MallEcoAPI.git
cd MallEcoAPI

# 启动基础服务
docker-compose up -d mysql redis rabbitmq

# 安装依赖
npm install

# 启动开发服务
npm run start:dev
```

### 3. 生产环境部署

```bash
# 构建生产镜像
docker build -t malleco-api:latest .

# 启动生产服务
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Kubernetes 部署

项目支持 Kubernetes 部署，提供完整的 deployment 和 service 配置。

---

## 使用指南

### 1. 基础使用

```typescript
// 使用共享模块
import { SharedModule } from '@shared/shared.module';

@Module({
  imports: [SharedModule],
})
export class AppModule {}
```

### 2. 错误码使用

```typescript
import { ErrorCode, getErrorMessage } from '@shared/exceptions';

throw new HttpException(
  {
    code: ErrorCode.USR_NOT_FOUND,
    message: getErrorMessage(ErrorCode.USR_NOT_FOUND),
  },
  HttpStatus.BAD_REQUEST,
);
```

### 3. 分布式锁使用

```typescript
import { LockService } from '@shared/lock/lock.service';

const result = await this.lockService.acquire('order:create:123');
if (result.success) {
  try {
    // 业务逻辑
  } finally {
    await result.release();
  }
}
```

### 4. 数据脱敏使用

```typescript
import { DesensitizeService } from '@shared/security/desensitize.service';

const sensitiveData = {
  phone: '13800138000',
  idCard: '110101199001011234',
};
const result = this.desensitizeService.desensitizeObject(sensitiveData);
// { phone: '138****8000', idCard: '110101****1234' }
```

### 5. 审计日志使用

```typescript
import { AuditService } from '@shared/audit/audit.service';

await this.auditService.log({
  userId: '123',
  username: 'admin',
  module: 'users',
  operation: 'CREATE',
  method: 'POST',
  url: '/api/users',
  ip: '127.0.0.1',
});
```

---

## API 文档

项目集成了完整的 Swagger API 文档，启动服务后访问：

| 地址               | 说明           |
| ---------------- | ------------ |
| `/api-docs`      | Swagger UI   |
| `/api-docs-json` | OpenAPI JSON |

---

## 监控运维

### 1. 健康检查

| 端点             | 说明   |
| -------------- | ---- |
| `/api/health`  | 健康检查 |
| `/api/metrics` | 性能指标 |
| `/api/info`    | 应用信息 |

### 2. 日志管理

项目集成完整的日志系统，支持：

- 应用日志
- 访问日志
- 错误日志
- 审计日志

### 3. 性能监控

- 请求响应时间监控
- 数据库查询监控
- 缓存命中率监控
- API 访问统计

---

## 项目优势总结

### 与传统项目对比

| 特性   | 传统开发 | MallEco API |
| ---- | ---- | ----------- |
| 错误处理 | 分散   | 统一错误码体系     |
| 验证方式 | 分散   | 全局验证管道      |
| 响应格式 | 不统一  | 标准化响应       |
| 权限控制 | 基本   | 完整 RBAC     |
| 日志记录 | 基础   | 完整审计日志      |
| 国际化  | 无    | 多语言支持       |
| 并发控制 | 基础   | 分布式锁        |
| 数据安全 | 基础   | 数据脱敏        |

### 业务场景覆盖

- ✅ B2B 批发商采购
- ✅ B2C 零售商城
- ✅ C2C 二手交易
- ✅ 直播带货
- ✅ 分销推广
- ✅ 保险经纪
- ✅ O2O 线上线下

---

## 许可证

MIT License - 详见 LICENSE 文件

---

## 配置文件说明

### 1. 环境变量配置

项目采用环境变量配置，支持多环境切换：

| 环境变量             | 说明       | 默认值         |
| ---------------- | -------- | ----------- |
| `NODE_ENV`       | 运行环境     | development |
| `PORT`           | 服务端口     | 9000        |
| `API_PREFIX`     | API 前缀   | api         |
| `DB_HOST`        | 数据库地址    | localhost   |
| `DB_PORT`        | 数据库端口    | 3306        |
| `DB_USERNAME`    | 数据库用户名   | root        |
| `DB_PASSWORD`    | 数据库密码    | -           |
| `DB_DATABASE`    | 数据库名称    | mall_eco    |
| `REDIS_HOST`     | Redis 地址 | localhost   |
| `REDIS_PORT`     | Redis 端口 | 6379        |
| `JWT_SECRET`     | JWT 密钥   | -           |
| `JWT_EXPIRES_IN` | JWT 过期时间 | 7d          |

### 2. 配置文件结构

```
config/
├── .env                 # 环境变量 (不提交到版本控制)
├── .env.example        # 环境变量模板
├── .env.development    # 开发环境
├── .env.test          # 测试环境
└── .env.production    # 生产环境
```

### 3. 多环境配置

项目支持多环境配置切换：

```bash
# 开发环境
NODE_ENV=development npm run start:dev

# 测试环境
NODE_ENV=test npm run test

# 生产环境
NODE_ENV=production npm run start:prod
```

---

## 数据库设计

### 1. 核心数据表

| 分类   | 表名                   | 说明     |
| ---- | -------------------- | ------ |
| 用户相关 | users                | 用户基础信息 |
|      | members              | 会员信息   |
|      | roles                | 角色表    |
|      | permissions          | 权限表    |
| 商品相关 | goods                | 商品信息   |
|      | goods_category       | 商品分类   |
|      | goods_brand          | 品牌信息   |
|      | goods_sku            | 商品 SKU |
| 订单相关 | orders               | 订单主表   |
|      | order_items          | 订单明细   |
|      | shopping_cart        | 购物车    |
| 支付相关 | payment_records      | 支付记录   |
|      | refunds              | 退款记录   |
| 营销相关 | coupons              | 优惠券    |
|      | promotion_activities | 促销活动   |
|      | commission_records   | 佣金记录   |

### 2. 实体关系概述

```
用户 ──┬── 角色 ── 权限
      │
      ├── 会员等级
      │
      └── 地址

商品 ──┬── 分类
      ├── 品牌
      └── SKU

订单 ──┬── 订单明细 ── 商品
      ├── 支付记录
      └── 物流信息
```

### 3. 索引设计策略

- 主键索引：自动使用主键
- 唯一索引：用于唯一性约束字段
- 复合索引：用于高频联合查询
- 全文索引：用于文本搜索

### 4. 分表策略

对于大数据量表（如订单表），采用分表策略：

- 按表：按时间分月/季度分表
- 按用户分表：按用户 ID 哈希分表
- 按业务分表：按业务类型分表

---

## 安全架构

### 1. 认证流程

```
用户登录
    │
    ▼
用户名密码验证
    │
    ├── 失败 ── 返回错误
    │
    └── 成功 ── 生成 JWT Token
                  │
                  ▼
            返回 Token 给客户端
                  │
                  ▼
            后续请求携带 Token
                  │
                  ▼
            服务端验证 Token
                  │
                  ├── 有效 ── 处理请求
                  │
                  └── 无效/过期 ── 返回 401
```

### 2. 权限控制模型

项目采用 RBAC (基于角色的访问控制) 模型：

```
用户 ── 角色 ── 权限
  │
  ├── 角色1 ── 权限A
  │         └── 权限B
  │
  ├── 角色2 ── 权限A
  │         └── 权限C
  │
  └── 角色3 ── 权限D
```

### 3. 数据安全

- **密码加密**：使用 BCrypt 加密存储
- **敏感数据脱敏**：手机号、身份证、银行卡等自动脱敏
- **SQL 注入防护**：参数化查询
- **XSS 防护**：输入过滤和输出编码
- **CSRF 防护**：Token 验证

### 4. API 安全

- 请求频率限制 (Rate Limiting)
- IP 黑名单/白名单
- 请求体大小限制
- HTTPS 强制使用
- CORS 配置

---

## 性能优化

### 1. 缓存策略

| 缓存类型 | 缓存内容     | TTL     |
| ---- | -------- | ------- |
| 热点数据 | 商品信息、分类  | 5-30 分钟 |
| 配置数据 | 系统配置、字典  | 1-24 小时 |
| 会话数据 | 用户 Token | 7 天     |
| 统计数据 | 排行榜、统计   | 5-15 分钟 |

### 2. 数据库优化

- 连接池管理：合理配置连接池大小
- 查询优化：避免全表扫描，使用索引
- 读写分离：主从复制，分离读写压力
- 分表分库：水平/垂直分表

### 3. 接口优化

- 接口合并：减少网络请求次数
- 数据分页：避免一次返回大量数据
- 字段精简：按需返回必要字段
- 异步处理：非核心逻辑异步执行

### 4. 性能监控指标

| 指标       | 目标值     | 说明   |
| -------- | ------- | ---- |
| API 响应时间 | < 200ms | P95  |
| 数据库查询时间  | < 50ms  | 平均值  |
| 缓存命中率    | > 80%   | 热点数据 |
| CPU 使用率  | < 70%   | 峰值   |
| 内存使用率    | < 80%   | 稳定态  |

---

## 测试策略

### 1. 测试类型

| 类型     | 说明      | 覆盖率目标 |
| ------ | ------- | ----- |
| 单元测试   | 函数/方法级别 | > 70% |
| 集成测试   | 模块交互    | > 50% |
| E2E 测试 | 关键业务流程  | 100%  |

### 2. 测试工具

- **Jest**：单元测试和集成测试
- **Supertest**：HTTP 接口测试
- **Mock**：数据模拟

### 3. 测试数据

- 使用工厂模式生成测试数据
- 支持数据清理和回滚
- 模拟第三方服务

---

## CI/CD 流程

### 1. 持续集成

```
代码提交
    │
    ▼
代码检查 (ESLint)
    │
    ▼
单元测试
    │
    ▼
代码构建
    │
    ├── 失败 ── 通知
    │
    └── 成功 ── 镜像构建
```

### 2. 持续部署

```
镜像构建
    │
    ▼
镜像推送
    │
    ▼
部署测试环境
    │
    ├── 失败 ── 回滚
    │
    └── 成功 ── 部署预发布
                  │
                  ├── 失败 ── 回滚
                  │
                  └── 成功 ── 部署生产
```

### 3. 部署策略

- 蓝绿部署：无 downtime
- 滚动部署：逐步替换
- 金丝雀发布：灰度放量

---

## 故障排查

### 1. 常见问题

| 问题现象    | 可能原因        | 解决方案   |
| ------- | ----------- | ------ |
| 服务启动失败  | 端口被占用       | 检查端口占用 |
| 数据库连接失败 | 数据库未启动/配置错误 | 检查配置   |
| 接口超时    | 慢查询/外部服务    | 查看日志定位 |
| 内存溢出    | 内存泄漏/并发过高   | 调优 JVM |

### 2. 日志分析

| 日志类型 | 文件位置            | 用途     |
| ---- | --------------- | ------ |
| 应用日志 | logs/app.log    | 业务问题排查 |
| 错误日志 | logs/error.log  | 错误定位   |
| 访问日志 | logs/access.log | 性能分析   |
| 审计日志 | logs/audit.log  | 安全审计   |

### 3. 调试命令

```bash
# 查看服务状态
docker ps

# 查看服务日志
docker logs -f malleco-api

# 进入容器
docker exec -it malleco-api bash

# 查看资源使用
docker stats

# 数据库连接测试
docker exec -it mysql mysql -u root -p -e "SELECT 1"
```

---

## 常见问题

### Q1: 如何重置管理员密码？

通过命令行工具重置密码，或直接修改数据库用户表。

### Q2: 如何备份和恢复数据库？

使用 mysqldump 进行备份，source 命令进行恢复。

### Q3: 如何扩展服务实例？

修改 docker-compose.yml 中的 replicas 数量，或在 Kubernetes 中调整 Deployment 的副本数。

### Q4: 如何配置 HTTPS？

在 Nginx 中配置 SSL 证书，或使用云服务商的负载均衡器配置。

### Q5: 如何处理高并发？

- 增加服务实例
- 启用缓存
- 异步处理
- 限流熔断

---

## 术语表

| 术语   | 说明                   |
| ---- | -------------------- |
| RBAC | 基于角色的访问控制            |
| JWT  | JSON Web Token，无状态认证 |
| API  | 应用程序接口               |
| SDK  | 软件开发工具包              |
| TTL  | 缓存生存时间               |
| CRUD | 创建、读取、更新、删除          |
| ORM  | 对象关系映射               |
| DTO  | 数据传输对象               |
| CQRS | 命令查询职责分离             |
| O2O  | 线上到线下                |
| B2B  | 企业对企业                |
| B2C  | 企业对消费者               |

---

## 最佳实践

### 1. 开发规范

- 使用 TypeScript 严格模式
- 保持函数短小单一
- 合理使用 async/await
- 避免 any 类型

### 2. 性能建议

- 减少数据库查询次数
- 合理使用索引
- 使用缓存减轻压力
- 异步处理非核心逻辑

### 3. 安全建议

- 不在代码中硬编码敏感信息
- 启用所有安全选项
- 定期更新依赖
- 记录审计日志

### 4. 运维建议

- 监控告警到位
- 日志定期清理
- 备份定期测试
- 文档及时更新

---

<p align="center">如果这个项目对你有帮助，请给我们一个 ⭐</p>
