import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { initializeDatabase } from './database-init';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import cookieParser from 'cookie-parser';
import * as Express from 'express';
import { MonitoringService } from './modules/monitoring/services/monitoring.service';
import { Logger } from '@nestjs/common';

function printModuleInfo(configService: ConfigService, logger: Logger) {
  const rabbitmqEnabled = configService.get('RABBITMQ_ENABLED') === 'true';
  const redisHost = configService.get('REDIS_HOST');
  const redisEnabled = redisHost && redisHost !== '';
  const consulEnabled = configService.get('CONSUL_HOST') !== 'localhost';

  logger.log('应用模块信息: ');
  logger.log(' ├── 权限管理模块 ✅ 已启用 ');
  logger.log(' ├── 商品管理模块 ✅ 已启用 ');
  logger.log(' ├── 购物车模块 ✅ 已启用 ');
  logger.log(' ├── 订单管理模块 ✅ 已启用 ');
  logger.log(' ├── 钱包系统模块 ✅ 已启用 ');
  logger.log(' ├── 促销营销模块 ✅ 已启用 ');
  logger.log(' ├── 分销系统模块 ✅ 已启用 ');
  logger.log(' ├── 内容管理模块 ✅ 已启用 ');
  logger.log(' ├── 直播模块 ✅ 已启用 ');
  logger.log(' ├── 支付模块 ✅ 已启用 ');
  logger.log(' ├── 短信模块 ✅ 已启用 ');
  logger.log(' ├── 邮件模块 ✅ 已启用 ');
  logger.log(' ├── 文件管理模块 ✅ 已启用 ');
  logger.log(' ├── 买家模块 ✅ 已启用 ');
  logger.log(' ├── 商家模块 ✅ 已启用 ');
  logger.log(' ├── 管理后台模块 ✅ 已启用 ');
  logger.log(' ├── 即时通讯模块 ✅ 已启用 ');
  logger.log(' ├── 地址管理模块 ✅ 已启用 ');
  logger.log(' ├── 会员管理模块 ✅ 已启用 ');
  logger.log(' ├── 店铺管理模块 ✅ 已启用 ');
  logger.log(' ├── 交易模块 ✅ 已启用 ');
  logger.log(' ├── 微信模块 ✅ 已启用 ');
  logger.log(' ├── 物流模块 ✅ 已启用 ');
  logger.log(' ├── 反馈模块 ✅ 已启用 ');
  logger.log(' ├── 通用模块 ✅ 已启用 ');
  logger.log(' ├── 保险模块 ✅ 已启用 ');
  logger.log(` ├── 消息队列模块 ${rabbitmqEnabled ? '✅ 已启用' : '⚠️ 未配置'} `);
  logger.log(` ├── 缓存模块 ${redisEnabled ? '✅ 已启用' : '⚠️ 未配置'} `);
  logger.log(` └── 服务发现模块 ${consulEnabled ? '✅ 已启用' : '⚠️ 未配置'} `);
  logger.log('技术栈: ');
  logger.log(' ├── 框架: NestJS + TypeScript ');
  logger.log(' ├── 数据库: MySQL + TypeORM ');
  logger.log(` ├── 缓存: ${redisEnabled ? 'Redis' : '内存缓存'} `);
  logger.log(` ├── 消息队列: ${rabbitmqEnabled ? 'RabbitMQ' : '内存队列'} `);
  logger.log(' ├── 搜索: 数据库搜索 ');
  logger.log(' ├── 认证: JWT + Passport ');
  logger.log(' ├── 文档: Swagger ');
  logger.log(` ├── 服务发现: ${consulEnabled ? 'Consul' : '静态配置'} `);
  logger.log(' └── 部署: Docker + PM2 ');
  logger.log('可用API端点: ');
  logger.log(' ├── 买家API: /api/buyer/* ');
  logger.log(' ├── 商家API: /api/seller/* ');
  logger.log(' ├── 管理API: /api/manager/* ');
  logger.log(' ├── 通用API: /api/common/* ');
  logger.log(' ├── 权限API: /api/auth/* ');
  logger.log(' ├── 商品API: /api/goods/* ');
  logger.log(' ├── 订单API: /api/orders/* ');
  logger.log(' ├── 支付API: /api/payment/* ');
  logger.log(' ├── 钱包API: /api/wallet/* ');
  logger.log(' ├── 促销API: /api/promotion/* ');
  logger.log(' ├── 分销API: /api/distribution/* ');
  logger.log(' ├── 内容API: /api/content/* ');
  logger.log(' ├── 直播API: /api/live/* ');
  logger.log(' ├── 文件API: /api/file/* ');
  logger.log(' ├── 短信API: /api/sms/* ');
  logger.log(' ├── 邮件API: /api/email/* ');
  logger.log(' ├── 物流API: /api/logistics/* ');
  logger.log(' ├── 即时通讯API: /api/im/* ');
  logger.log(' ├── 微信API: /api/wechat/* ');
  logger.log(' ├── 统计API: /api/statistics/* ');
  logger.log(' └── 保险API: /api/insurance/* ');
  logger.log('开发命令: ');
  logger.log(' ├── 启动开发: npm run start:dev ');
  logger.log(' ├── 构建生产: npm run build ');
  logger.log(' ├── 启动生产: npm run start:prod ');
  logger.log(' ├── 数据库初始化: npm run db:init ');
  logger.log(' ├── 菜单初始化: npm run menu:init ');
  logger.log(' ├── 代码检查: npm run lint ');
  logger.log(' └── 测试: npm run test ');
  logger.log('监控端点: ');
  logger.log(' ├── 健康检查: /api/health ');
  logger.log(' ├── 监控指标: /api/metrics ');
  logger.log(' ├── 应用信息: /api/info ');
  logger.log(' └── 系统状态: /api/status ');
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    // 在应用启动前执行数据库初始化
    logger.log('🚀 启动数据库初始化检查...');
    const dbInitSuccess = await initializeDatabase();

    if (!dbInitSuccess) {
      logger.warn('⚠️ 数据库初始化失败，应用仍将继续启动，但数据库功能可能不可用');
    }

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // 处理根路径请求
    app.use('/', (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
      if (req.path === '/') {
        return res.json({
          name: 'MallEco API',
          version: '1.0.0',
          description: '电商生态系统API',
          availableAPIs: {
            products: '/api/products',
            rbac: '/api/rbac',
            auth: '/api/auth',
            cart: '/api/cart',
            orders: '/api/orders',
            wallet: '/api/wallet',
            promotion: '/api/promotion',
            distribution: '/api/distribution',
            content: '/api/content',
            live: '/api/live',
            monitoring: '/api/monitoring',
          },
          documentation: '访问 /api-docs 查看Swagger文档',
        });
      }
      next();
    });

    // 设置全局 API 前缀
    app.setGlobalPrefix('api');

    // 静态文件服务已在 app.module.ts 中通过 ServeStaticModule 配置

    // 应用全局异常过滤器
    app.useGlobalFilters(new HttpExceptionFilter());

    // 应用全局响应拦截器
    app.useGlobalInterceptors(new ResponseInterceptor());

    // 配置 CORS
    const configService = app.get(ConfigService);
    const corsConfigValue = configService.get(
      'CORS_ALLOWED_ORIGINS',
      'http://localhost:3000,http://localhost:8080',
    );
    const allowedOrigins = (corsConfigValue as string).split(',');
    app.enableCors({
      origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void,
      ) => {
        // 在开发环境中允许所有来源
        if (process.env.NODE_ENV === 'development' || (origin && allowedOrigins.includes(origin))) {
          callback(null, true);
        } else {
          callback(new Error('CORS origin not allowed'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-API-Key',
        'X-Requested-With',
        'Accept',
        'Origin',
        'uuid',
        'accessToken',
      ],
      exposedHeaders: ['Content-Length', 'Content-Disposition'],
      credentials: true,
      maxAge: 86400, // 24小时
    });

    // 使用 cookie-parser 解析 cookies
    app.use(cookieParser());

    // 添加安全 HTTP 头
    const helmetOptions = {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'cdn.jsdelivr.net'],
          styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
          imgSrc: ["'self'", 'data:', '*.gravatar.com', '*.googleusercontent.com'],
          fontSrc: ["'self'", 'fonts.gstatic.com'],
          connectSrc: ["'self'", 'api.malleco.com'],
          frameSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' as const },
    };
    app.use(helmet(helmetOptions));

    // API 速率限制
    const apiRateLimit = rateLimit({
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 1000, // 每个IP限制1000个请求（开发环境放宽限制）
      message: {
        success: false,
        code: 429,
        message: '请求过于频繁，请稍后再试',
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: req => {
        // 跳过健康检查、文档请求和开发环境
        return (
          req.path.includes('/health') ||
          req.path.includes('/api-docs') ||
          req.ip === '127.0.0.1' ||
          req.ip === '::1'
        );
      },
    });

    // 认证接口更严格的速率限制
    const authRateLimit = rateLimit({
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 100, // 每个IP限制100个请求（开发环境放宽限制）
      message: {
        success: false,
        code: 429,
        message: '认证请求过于频繁，请稍后再试',
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: req => {
        // 跳过开发环境
        return req.ip === '127.0.0.1' || req.ip === '::1';
      },
    });

    // 请求速度限制（防止暴力攻击）
    const speedLimiter = slowDown({
      windowMs: 15 * 60 * 1000, // 15分钟
      delayAfter: 50, // 前50个请求不延迟
      delayMs: hits => hits * 100, // 每个后续请求延迟100ms
      maxDelayMs: 2000, // 最大延迟2秒
    });

    // 应用速率限制
    app.use('/api', apiRateLimit);
    app.use('/api/auth', authRateLimit);
    app.use(speedLimiter);

    // 监控中间件 - 记录HTTP请求指标
    app.use(
      '/api',
      async (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
        const start = Date.now();
        const originalSend = res.send;

        // 重写res.send方法以捕获状态码
        res.send = function (body: unknown) {
          const duration = Date.now() - start;
          const statusCode = res.statusCode;

          // 异步记录请求指标
          try {
            const monitoringService = (req.app as unknown as NestExpressApplication).get(
              MonitoringService,
            );
            if (monitoringService) {
              void monitoringService.recordHttpRequest(duration, statusCode);
            }
          } catch (error) {
            logger.error('监控中间件错误:', error);
          }

          return originalSend.call(this, body);
        };

        next();
      },
    );

    // 配置请求体大小限制
    app.use('/api', (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
      // 限制上传文件的大小为10MB
      if (req.path.includes('/file/upload')) {
        (req as Express.Request & { maxBodyLength?: number }).maxBodyLength = 10 * 1024 * 1024;
      } else {
        // 其他API请求限制为1MB
        (req as Express.Request & { maxBodyLength?: number }).maxBodyLength = 1 * 1024 * 1024;
      }
      next();
    });

    // 配置安全的 cookie 设置
    app.use((req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
      // 只有在启用了 CSRF 保护时才设置 XSRF-TOKEN
      const reqWithCsrf = req as Express.Request & { csrfToken?: () => string };
      if (reqWithCsrf.csrfToken) {
        res.cookie('XSRF-TOKEN', reqWithCsrf.csrfToken(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
          maxAge: 86400000,
        });
      }
      next();
    });

    // 添加安全相关的响应头
    app.use((req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
      // 防止点击劫持
      res.setHeader('X-Frame-Options', 'DENY');
      // 防止MIME类型嗅探
      res.setHeader('X-Content-Type-Options', 'nosniff');
      // 启用严格传输安全（仅在HTTPS环境下）
      if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      }
      next();
    });

    // 配置 Swagger
    const swaggerConfigService = app.get(ConfigService);
    const swaggerPort = swaggerConfigService.get('PORT') || 9000;
    const nodeEnv = swaggerConfigService.get('NODE_ENV') || 'development';

    const swaggerConfig = new DocumentBuilder()
      .setTitle('MallEco API')
      .setDescription(
        `
# MallEco商城系统API文档

## 系统介绍
MallEco是一个功能完整的电商系统，支持多端（买家端、商家端、管理端）业务场景，提供全面的电商解决方案。

## 认证说明
### JWT认证
大部分API需要JWT认证，请在请求头中添加：
\`\`\`
Authorization: Bearer <your-token>
\`\`\`

### 认证流程
1. 调用登录接口获取token
2. 使用token访问受保护的API
3. token过期后使用refresh token获取新token

## 环境信息
- **当前环境**: ${nodeEnv}
- **API地址**: http://localhost:${swaggerPort}
- **文档版本**: v1.0
- **API前缀**: /api

## 主要功能模块
### 核心业务
- 用户认证与授权
- 商品管理
- 购物车管理
- 订单管理
- 支付管理
- 会员管理

### 营销功能
- 促销活动管理
- 优惠券管理
- 分销管理

### 系统功能
- 内容管理
- 直播管理
- 统计分析
- 系统配置

## API使用示例
### 获取商品列表
\`\`\`bash
curl -X GET "http://localhost:${swaggerPort}/api/goods"
\`\`\`

### 带认证的请求
\`\`\`bash
curl -X GET "http://localhost:${swaggerPort}/api/manager/statistics/dashboard" \\
  -H "Authorization: Bearer <your-token>"
\`\`\`

## 错误处理
所有API返回统一的错误格式：
\`\`\`json
{
  "success": false,
  "code": 400,
  "message": "错误信息",
  "data": null
}
\`\`\`

## 响应格式
所有API返回统一的响应格式：
\`\`\`json
{
  "success": true,
  "code": 200,
  "message": "成功信息",
  "data": {}
}
\`\`\`
      `,
      )
      .setVersion('1.0')
      .setContact('MallEco团队', 'https://github.com/malleco', 'support@malleco.com')
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .addServer(`http://localhost:${swaggerPort}`, '本地开发环境')
      .addServer(`http://0.0.0.0:${swaggerPort}`, '本地网络环境')
      .addServer('https://api-dev.malleco.com', '开发环境')
      .addServer('https://api.malleco.com', '生产环境')
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-API-Key',
          in: 'header',
        },
        'apiKeyAuth',
      )
      // 核心业务模块
      .addTag('认证', '用户认证与授权相关接口')
      .addTag('用户管理', '用户信息管理接口')
      .addTag('即时通讯', 'IM消息和WebSocket实时通讯接口')
      // 商品相关
      .addTag('商品', '商品信息管理接口')
      .addTag('商品分类', '商品分类管理接口')
      .addTag('购物车管理', '购物车操作接口')
      // 订单相关
      .addTag('订单管理', '订单创建、查询、管理接口')
      .addTag('支付管理', '支付相关接口')
      // 会员相关
      .addTag('会员管理', '会员信息管理接口')
      .addTag('钱包管理', '用户钱包和余额管理接口')
      // 营销相关
      .addTag('促销营销', '促销活动管理接口')
      .addTag('分销管理', '分销业务管理接口')
      .addTag('优惠券', '优惠券管理接口')
      // 内容相关
      .addTag('内容管理', '内容发布和管理接口')
      .addTag('直播管理', '直播功能接口')
      // 权限相关
      .addTag('角色管理', '角色管理接口')
      .addTag('权限管理', '权限管理接口')
      .addTag('部门管理', '部门管理接口')
      // 统计相关
      .addTag('销售统计', '销售数据统计接口')
      .addTag('订单统计', '订单数据统计接口')
      .addTag('用户统计', '用户数据统计接口')
      .addTag('财务统计', '财务数据统计接口')
      .addTag('仪表盘', '数据仪表盘接口')
      // 系统管理
      .addTag('系统管理', '系统配置和管理接口')
      .addTag('系统配置管理', '系统配置管理接口')
      .addTag('系统日志管理', '系统日志管理接口')
      .addTag('系统监控', '系统监控接口')
      .addTag('系统诊断管理', '系统诊断管理接口')
      .addTag('系统版本管理', '系统版本管理接口')
      .addTag('系统备份管理', '系统备份管理接口')
      // 基础设施
      .addTag('性能监控', '性能监控接口')
      .addTag('缓存管理', '缓存管理接口')
      .addTag('数据库管理', '数据库管理接口')
      .addTag('微服务管理', '微服务管理接口')
      .addTag('服务网格管理', '服务网格管理接口')
      .addTag('推荐模块', '推荐算法接口')
      // 其他
      .addTag('文件管理', '文件上传下载接口')
      .addTag('短信服务', '短信发送接口')
      .addTag('邮件服务', '邮件发送接口')
      .addTag('物流管理', '物流信息管理接口')
      .addTag('微信服务', '微信相关接口')
      .addTag('反馈管理', '用户反馈管理接口')
      .addTag('售后管理', '售后处理接口')
      .addTag('品牌', '品牌管理接口')
      .addTag('页面数据', '页面数据接口')
      .addTag('通用-文件上传', '通用文件上传接口')
      .addTag('通用', '通用接口')
      .addTag('地址管理', '地址管理接口')
      .addTag('交易管理', '交易管理接口')
      .addTag('店铺管理', '店铺管理接口')
      .addTag('搜索', '搜索功能接口')
      .addTag('监控仪表板', '监控仪表板接口')
      .addTag('健康检查', '健康检查接口')
      .addTag('菜单管理', '菜单管理接口')
      .addTag('统计管理', '统计管理接口')
      .addTag('公众号管理', '公众号管理接口')
      .addTag('公众号管理-消息管理', '公众号消息管理接口')
      .addTag('公众号管理-授权用户管理', '公众号授权用户管理接口')
      .addTag('公众号管理-授权令牌管理', '公众号授权令牌管理接口')
      .addTag('公众号管理-授权应用管理', '公众号授权应用管理接口')
      .addTag('公众号管理-自定义菜单', '公众号自定义菜单接口')
      .addTag('公众号管理-素材管理', '公众号素材管理接口')
      .addTag('公众号管理-H5网页', '公众号H5网页接口')
      .addTag('公众号管理-微信卡券', '公众号微信卡券接口')
      .addTag('卖家端-店铺设置', '卖家端店铺设置接口')
      .addTag('管理端-数据统计', '管理端数据统计接口')
      .addTag('管理端-系统设置', '管理端系统设置接口')
      .addTag('权限管理 - 菜单管理', '权限管理菜单管理接口')
      .addTag('通知管理', '通知管理接口')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: '输入JWT Token，格式：Bearer <token>',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig, {
      operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    });

    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
        docExpansion: 'list',
        filter: true,
        showRequestDuration: true,
        tryItOutEnabled: true,
        requestSnippetsEnabled: true,
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
        deepLinking: true,
      },
      customSiteTitle: 'MallEco API 文档',
      customfavIcon: '/favicon.ico',
      customJs: '/swagger-custom.js',
      customCss: '/swagger-custom.css',
    });

    // 获取配置服务
    const appConfigService = app.get(ConfigService);

    // 从环境变量获取端口
    const appPort = appConfigService.get('PORT') || 9000;
    logger.log(`📝 配置的端口: ${appPort}`);

    await app.listen(appPort, '0.0.0.0', () => {
      logger.log(`🚀 服务已启动在 http://localhost:${appPort}`);
      logger.log(`🌐 服务已启动在 http://0.0.0.0:${appPort} (可从外部访问)`);
      logger.log(`📖 Swagger文档可用在 http://localhost:${appPort}/api-docs`);
      logger.log(`📖 Swagger文档可用在 http://0.0.0.0:${appPort}/api-docs (可从外部访问)`);

      // 打印模块信息
      printModuleInfo(appConfigService, logger);
    });

    logger.log('✅ 应用程序启动成功');
  } catch (error) {
    logger.error('❌ 应用程序启动失败:', error);
    process.exit(1);
  }
}
void bootstrap();
