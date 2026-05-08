# CDN 配置指南

本文档介绍如何为 MallEco API 配置 CDN 加速服务。

## 支持的 CDN 服务

| CDN 服务商 | 配置文件位置                            | 说明                |
| ---------- | --------------------------------------- | ------------------- |
| 阿里云 CDN | `config/cdn/aliyun-cdn.conf`            | 阿里云全站加速      |
| 腾讯云 CDN | `config/cdn/tencent-cdn.conf`           | 腾讯云 CDN          |
| Cloudflare | `config/cdn/cloudflare-page-rules.conf` | Cloudflare 页面规则 |

---

## 阿里云 CDN 配置

### 1. 在阿里云控制台配置

1. 登录阿里云 CDN 控制台
2. 添加加速域名：`api.malleco.com`
3. 配置源站信息：填写 Nginx 服务器 IP 或域名
4. 设置缓存规则

### 2. 缓存配置

```json
{
  "cache_rules": [
    {
      "type": "file_extension",
      "value": "js,css,png,jpg,jpeg,gif,ico,svg,woff,woff2,ttf,eot",
      "ttl": 2592000,
      "weight": 30
    },
    {
      "type": "path",
      "value": "/api-docs",
      "ttl": 0,
      "weight": 70
    },
    {
      "type": "path",
      "value": "/api/*",
      "ttl": 0,
      "weight": 70
    }
  ]
}
```

### 3. 回源配置

```json
{
  "back_origin": {
    "host": "api.malleco.com",
    "protocol": "https"
  }
}
```

---

## 腾讯云 CDN 配置

### 1. 在腾讯云控制台配置

1. 登录腾讯云 CDN 控制台
2. 添加加速域名
3. 配置源站为 Nginx 服务器
4. 设置缓存策略

### 2. 缓存配置

```json
{
  "cache": {
    "rules": [
      {
        "type": 0,
        "cache_time": 2592000,
        "pattern": "*.js|*.css|*.png|*.jpg|*.jpeg|*.gif|*.ico|*.svg|*.woff|*.woff2"
      },
      {
        "type": 0,
        "cache_time": 0,
        "pattern": "/api/*"
      }
    ]
  }
}
```

---

## Cloudflare 配置

### 1. DNS 配置

在 Cloudflare 添加 DNS 记录：

| 类型  | 名称 | 内容            | 代理状态 |
| ----- | ---- | --------------- | -------- |
| A     | api  | 你的服务器 IP   | Proxied  |
| CNAME | www  | api.malleco.com | Proxied  |

### 2. 页面规则 (Page Rules)

```yaml
# 静态资源缓存
URL: api.malleco.com/*.js
Cache Level: Cache Everything
Edge Cache TTL: 1 month
Browser Cache TTL: 1 month

# API 不缓存
URL: api.malleco.com/api/*
Cache Level: Bypass
```

### 3. Worker 配置 (可选)

```javascript
// Cloudflare Worker 示例
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // API 请求不缓存
  if (request.url.includes('/api/')) {
    return fetch(request);
  }

  // 其他请求走缓存
  return fetch(request);
}
```

---

## 完整 CDN 架构

```
                    ┌─────────────────┐
                    │    用户浏览器     │
                    └────────┬────────┘
                             │
                             ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN 边缘节点    │───▶│  CDN 源站服务器  │───▶│   API 后端      │
│  (全球加速节点)   │    │   (Nginx)      │    │  (NestJS)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                                                 │
        │ 静态资源 (JS/CSS/图片)                          │ API 请求
        ▼                                                 ▼
   浏览器缓存                                         数据库/缓存
```

---

## CDN 加速内容

| 类型        | 示例               | 缓存时间 |
| ----------- | ------------------ | -------- |
| 静态 JS/CSS | `/static/*.js`     | 30 天    |
| 图片资源    | `/*.png`, `/*.jpg` | 30 天    |
| 字体文件    | `/*.woff2`         | 30 天    |
| API 文档    | `/api-docs/*`      | 不缓存   |
| API 接口    | `/api/*`           | 不缓存   |
| 健康检查    | `/health`          | 不缓存   |

---

## 配置示例

### 环境变量配置

在 `config/.env` 中添加：

```env
# CDN 配置
CDN_ENABLED=true
CDN_PROVIDER=aliyun
CDN_DOMAIN=api.malleco.com
CDN_HTTPS=true
```

### Nginx 配合 CDN

```nginx
# CDN 回源时区分
map $http_x_forwarded_proto $scheme {
    default $scheme;
    https https;
}

server {
    # 区分 CDN 请求和直接请求
    set $is_cdn 0;
    if ($http_x_cdn_ip ~* "^(.*)$") {
        set $is_cdn 1;
    }

    # CDN 请求不记录日志
    access_log /var/log/nginx/access.log main if=$is_cdn;
}
```

---

## 性能优化建议

### 1. 开启 HTTP/2

```nginx
server {
    listen 443 ssl http2;
}
```

### 2. 启用 Brotli 压缩

```nginx
# 需要安装 ngx_brotli 模块
brotli on;
brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
brotli_comp_level 6;
```

### 3. 开启 QUIC (HTTP/3)

```nginx
# 需要 Nginx 1.25+ 版本
listen 443 quic;
```

---

## 监控与运维

### CDN 监控指标

| 指标     | 说明         | 告警阈值  |
| -------- | ------------ | --------- |
| QPS      | 每秒请求数   | > 10000   |
| 命中率   | 缓存命中率   | < 80%     |
| 回源带宽 | 回源带宽使用 | > 500Mbps |
| 延迟     | 首屏加载时间 | > 2s      |

### 日志分析

```bash
# 查看 CDN 请求日志
tail -f /var/log/nginx/cdn-access.log

# 分析热门资源
awk '{print $7}' /var/log/nginx/cdn-access.log | sort | uniq -c | sort -nr | head -20

# 分析请求来源
awk '{print $1}' /var/log/nginx/cdn-access.log | sort | uniq -c | sort -nr | head -10
```

---

## 故障排查

### 常见问题

| 问题           | 原因             | 解决方案            |
| -------------- | ---------------- | ------------------- |
| 静态资源加载慢 | CDN 节点较远     | 选择更近的 CDN 节点 |
| 缓存未生效     | 缓存规则配置错误 | 检查缓存配置        |
| 回源失败       | 源站地址错误     | 检查源站配置        |
| HTTPS 报错     | SSL 证书问题     | 检查证书配置        |

### 验证 CDN 是否生效

```bash
# 检查 CDN 响应头
curl -I https://api.malleco.com/static/app.js

# 期望看到
# X-Cache: HIT from cache
# X-Cdn-Request-Id: xxx
```
