/**
 * 错误码规范
 *
 * 使用方法:
 * import { ErrorCode, getErrorMessage } from '@shared/exceptions/error-code';
 *
 * // 在异常中使用
 * throw new HttpException({
 *   code: ErrorCode.USR_NOT_FOUND,
 *   message: getErrorMessage(ErrorCode.USR_NOT_FOUND),
 * }, HttpStatus.BAD_REQUEST);
 *
 * 错误码范围:
 * - 通用错误 (GLO): 000-099
 * - 用户模块 (USR): 1000-1099
 * - 认证模块 (AUTH): 1100-1199
 * - 会员模块 (MEM): 1200-1299
 * - 订单模块 (ORD): 1300-1399
 * - 商品模块 (GDS): 1400-1499
 * - 购物车模块 (CART): 1500-1599
 * - 支付模块 (PAY): 1600-1699
 * - 更多模块详见下方...
 */
export enum ErrorCode {
  // ==================== 通用错误 (GLO 000-099) ====================
  GLO_SUCCESS = 200,
  GLO_BAD_REQUEST = 400,
  GLO_UNAUTHORIZED = 401,
  GLO_FORBIDDEN = 403,
  GLO_NOT_FOUND = 404,
  GLO_METHOD_NOT_ALLOWED = 405,
  GLO_CONFLICT = 409,
  GLO_VALIDATION_FAILED = 422,
  GLO_LOCKED = 423,
  GLO_TOO_MANY_REQUESTS = 429,
  GLO_INTERNAL_ERROR = 500,
  GLO_NOT_IMPLEMENTED = 501,
  GLO_SERVICE_UNAVAILABLE = 503,
  GLO_TIMEOUT = 504,
  GLO_BAD_GATEWAY = 502,

  // ==================== 用户模块 (USR 1000-1099) ====================
  USR_NOT_FOUND = 1001,
  USR_ALREADY_EXISTS = 1002,
  USR_DISABLED = 1003,
  USR_PASSWORD_ERROR = 1004,
  USR_PASSWORD_WEAK = 1005,
  USR_EMAIL_NOT_VERIFIED = 1006,
  USR_PHONE_NOT_VERIFIED = 1007,
  USR_INVALID_TOKEN = 1008,
  USR_TOKEN_EXPIRED = 1009,
  USR_INSUFFICIENT_PERMISSION = 1010,
  USR_ACCOUNT_LOCKED = 1011,
  USR_ACCOUNT_EXPIRED = 1012,
  USR_IP_BLOCKED = 1013,
  USR_LOGIN_REQUIRED = 1014,
  USR_INFO_INCOMPLETE = 1015,

  // ==================== 认证模块 (AUTH 1100-1199) ====================
  AUTH_LOGIN_FAILED = 1101,
  AUTH_LOGOUT_FAILED = 1102,
  AUTH_TOKEN_INVALID = 1103,
  AUTH_TOKEN_EXPIRED = 1104,
  AUTH_REFRESH_TOKEN_INVALID = 1105,
  AUTH_CAPTCHA_ERROR = 1106,
  AUTH_CAPTCHA_EXPIRED = 1107,
  AUTH_CAPTCHA_REQUIRED = 1108,
  AUTH_SMS_CODE_ERROR = 1109,
  AUTH_SMS_CODE_EXPIRED = 1110,
  AUTH_SMS_CODE_SEND_FAILED = 1111,
  AUTH_SMS_CODE_SEND_TOO_FREQUENT = 1112,
  AUTH_WECHAT_LOGIN_FAILED = 1113,
  AUTH_WECHAT_BIND_EXISTS = 1114,
  AUTH_WECHAT_BIND_FAILED = 1115,
  AUTH_EMAIL_CODE_ERROR = 1116,
  AUTH_EMAIL_CODE_EXPIRED = 1117,
  AUTH_THIRD_PARTY_BIND_EXISTS = 1118,
  AUTH_PASSWORD_RESET_FAILED = 1119,

  // ==================== 会员模块 (MEM 1200-1299) ====================
  MEM_NOT_FOUND = 1201,
  MEM_ALREADY_EXISTS = 1202,
  MEM_DISABLED = 1203,
  MEM_LEVEL_INVALID = 1204,
  MEM_POINTS_INSUFFICIENT = 1205,
  MEM_POINTS_LOCKED = 1206,
  MEM_INTEGRAL_NOT_ENOUGH = 1207,
  MEM_GRADE_UPGRADE_FAILED = 1208,
  MEM_BONUS_CLAIM_FAILED = 1209,

  // ==================== 订单模块 (ORD 1300-1399) ====================
  ORD_NOT_FOUND = 1301,
  ORD_ALREADY_EXISTS = 1302,
  ORD_STATUS_INVALID = 1303,
  ORD_STATUS_CANNOT_CANCEL = 1304,
  ORD_STATUS_CANNOT_REFUND = 1305,
  ORD_CANCEL_FAILED = 1306,
  ORD_CREATE_FAILED = 1307,
  ORD_PAYMENT_PENDING = 1308,
  ORD_SHIPPED = 1309,
  ORD_COMPLETED = 1310,
  ORD_CANCELLED = 1311,
  ORD_REFUND_FAILED = 1312,
  ORD_REFUND_AMOUNT_EXCEED = 1313,
  ORD_ITEM_NOT_FOUND = 1314,
  ORD_ADDRESS_INVALID = 1315,
  ORD_GOODS_CHANGED = 1316,
  ORD_GOODS_STOCK_INSUFFICIENT = 1317,
  ORD_PRICE_CHANGED = 1318,
  ORD_COMMENT_EXISTS = 1319,
  ORD_COMMENT_FAILED = 1320,

  // ==================== 商品模块 (GDS 1400-1499) ====================
  GDS_NOT_FOUND = 1401,
  GDS_ALREADY_EXISTS = 1402,
  GDS_STOCK_INSUFFICIENT = 1403,
  GDS_PRICE_INVALID = 1404,
  GDS_OFFLINE = 1405,
  GDS_NOT_ON_SALE = 1406,
  GDS_CATEGORY_NOT_FOUND = 1407,
  GDS_SKU_NOT_FOUND = 1408,
  GDS_SKU_DISABLED = 1409,
  GDS_BRAND_NOT_FOUND = 1410,
  GDS_IMAGE_UPLOAD_FAILED = 1411,
  GDS_SPEC_NOT_FOUND = 1412,
  GDS_REVIEW_NOT_FOUND = 1413,
  GDS_FAVORITE_EXISTS = 1414,
  GDS_FAVORITE_NOT_FOUND = 1415,

  // ==================== 购物车模块 (CART 1500-1599) ====================
  CART_NOT_FOUND = 1501,
  CART_ITEM_NOT_FOUND = 1502,
  CART_ITEM_EXISTS = 1503,
  CART_STOCK_INSUFFICIENT = 1504,
  CART_GOODS_OFFLINE = 1505,
  CART_GOODS_NOT_FOUND = 1506,
  CART_LIMIT_EXCEEDED = 1507,
  CART_EMPTY = 1508,

  // ==================== 支付模块 (PAY 1600-1699) ====================
  PAY_FAILED = 1601,
  PAY_AMOUNT_INVALID = 1602,
  PAY_TIMEOUT = 1603,
  PAY_CANCELLED = 1604,
  PAY_ALREADY_PAID = 1605,
  PAY_METHOD_INVALID = 1606,
  PAY_WECHAT_FAILED = 1607,
  PAY_ALIPAY_FAILED = 1608,
  PAY_BALANCE_INSUFFICIENT = 1609,
  PAY_SIGN_FAILED = 1610,
  PAY_ORDER_NOT_FOUND = 1611,
  PAY_CALLBACK_INVALID = 1612,
  PAY_REFUND_FAILED = 1613,
  PAY_REFUND_AMOUNT_INVALID = 1614,
  PAY_CHANNEL_UNAVAILABLE = 1615,

  // ==================== 物流模块 (LOG 1700-1799) ====================
  LOG_NOT_FOUND = 1701,
  LOG_COMPANY_NOT_FOUND = 1702,
  LOG_TRACKING_FAILED = 1703,
  LOG_ADDRESS_INVALID = 1704,
  LOG_SHIPPING_FAILED = 1705,
  LOG_TRACKING_NOT_FOUND = 1706,
  LOG_COMPANY_UNSUPPORTED = 1707,
  LOG_SIGN_FAILED = 1708,

  // ==================== 分销模块 (DIS 1800-1899) ====================
  DIS_NOT_FOUND = 1801,
  DIS_ALREADY_EXISTS = 1802,
  DIS_INVITE_CODE_INVALID = 1803,
  DIS_INVITE_CODE_EXPIRED = 1804,
  DIS_COMMISSION_FAILED = 1805,
  DIS_COMMISSION_LOCKED = 1806,
  DIS_WITHDRAW_FAILED = 1807,
  DIS_WITHDRAW_AMOUNT_INVALID = 1808,
  DIS_WITHDRAW_AMOUNT_TOO_LOW = 1809,
  DIS_WITHDRAW_AMOUNT_TOO_HIGH = 1810,
  DIS_WITHDRAW_FEE_INVALID = 1811,
  DIS_WITHDRAW_ALREADY_PROCESSING = 1812,
  DIS_LEVEL_INVALID = 1813,
  DIS_LEVEL_UPGRADE_FAILED = 1814,
  DIS_TEAM_INSUFFICIENT = 1815,
  DIS_BIND_SELF = 1816,
  COMMISSION_NOT_FOUND = 1820,

  // ==================== 优惠券模块 (CPN 1900-1999) ====================
  CPN_NOT_FOUND = 1901,
  CPN_ALREADY_USED = 1902,
  CPN_EXPIRED = 1903,
  CPN_NOT_STARTED = 1904,
  CPN_CONDITION_NOT_MET = 1905,
  CPN_LIMIT_EXCEEDED = 1906,
  CPN_USER_LIMIT_EXCEEDED = 1907,
  CPN_GOODS_LIMIT_EXCEEDED = 1908,
  CPN_CATEGORY_LIMIT_EXCEEDED = 1909,
  CPN_ALREADY_RECEIVED = 1910,
  CPN_INSUFFICIENT_STOCK = 1911,

  // ==================== 仓库/库存模块 (INV 2000-2099) ====================
  INV_NOT_FOUND = 2001,
  INV_STOCK_INSUFFICIENT = 2002,
  INV_STOCK_LOCKED = 2003,
  INV_STOCK_ERROR = 2004,
  INV_LOCATION_NOT_FOUND = 2005,
  INV_ADJUST_FAILED = 2006,
  INV_TRANSFER_FAILED = 2007,

  // ==================== 店铺模块 (STORE 2100-2199) ====================
  STORE_NOT_FOUND = 2101,
  STORE_ALREADY_EXISTS = 2102,
  STORE_DISABLED = 2103,
  STORE_NAME_DUPLICATE = 2104,
  STORE_SETTLEMENT_FAILED = 2105,
  STORE_COMMISSION_RATE_INVALID = 2106,
  STORE_CATEGORY_NOT_FOUND = 2107,

  // ==================== 售后模块 (AFS 2200-2299) ====================
  AFS_NOT_FOUND = 2201,
  AFS_ALREADY_EXISTS = 2202,
  AFS_STATUS_INVALID = 2203,
  AFS_REASON_REQUIRED = 2204,
  AFS_EVIDENCE_REQUIRED = 2205,
  AFS_REFUND_EXCEED = 2206,
  AFS_APPLY_FAILED = 2207,
  AFS_CANCEL_FAILED = 2208,
  AFS_SHIP_FAILED = 2209,
  AFS_CONFIRM_FAILED = 2210,

  // ==================== 评价模块 (REVIEW 2300-2399) ====================
  REVIEW_NOT_FOUND = 2301,
  REVIEW_ALREADY_EXISTS = 2302,
  REVIEW_CONTENT_INVALID = 2303,
  REVIEW_IMAGES_TOO_MANY = 2304,
  REVIEW_CANNOT_MODIFY = 2305,
  REVIEW_REPLY_FAILED = 2306,

  // ==================== 消息通知模块 (MSG 2400-2499) ====================
  MSG_SEND_FAILED = 2401,
  MSG_TEMPLATE_NOT_FOUND = 2402,
  MSG_RATE_LIMIT_EXCEEDED = 2403,
  MSG_CONTENT_TOO_LONG = 2404,
  MSG_RECEIVER_NOT_FOUND = 2405,
  MSG_TYPE_INVALID = 2406,

  // ==================== 微信模块 (WECHAT 2500-2599) ====================
  WECHAT_LOGIN_FAILED = 2501,
  WECHAT_USER_NOT_FOUND = 2502,
  WECHAT_TEMPLATE_SEND_FAILED = 2503,
  WECHAT_MENU_CREATE_FAILED = 2504,
  WECHAT_MATERIAL_UPLOAD_FAILED = 2505,
  WECHAT_JSAPI_SIGN_FAILED = 2506,
  WECHAT_PAY_SIGN_FAILED = 2507,
  WECHAT_AUTH_FAILED = 2508,

  // ==================== 文件模块 (FILE 2600-2699) ====================
  FILE_NOT_FOUND = 2601,
  FILE_UPLOAD_FAILED = 2602,
  FILE_TYPE_INVALID = 2603,
  FILE_SIZE_EXCEEDED = 2604,
  FILE_IMAGE_INVALID = 2605,
  FILE_DELETE_FAILED = 2606,
  FILE_MOVE_FAILED = 2607,
  FILE_COPY_FAILED = 2608,

  // ==================== 直播模块 (LIVE 2700-2799) ====================
  LIVE_NOT_FOUND = 2701,
  LIVE_ROOM_NOT_FOUND = 2702,
  LIVE_ROOM_DISABLED = 2703,
  LIVE_STREAM_FAILED = 2704,
  LIVE_PUSH_URL_EXPIRED = 2705,
  LIVE_PLAY_URL_EXPIRED = 2706,
  LIVE_GOODS_NOT_FOUND = 2707,
  LIVE_GOODS_OFFLINE = 2708,
  LIVE_COMMENT_FAILED = 2709,

  // ==================== IM模块 (IM 2800-2899) ====================
  IM_USER_NOT_FOUND = 2801,
  IM_MESSAGE_SEND_FAILED = 2802,
  IM_MESSAGE_CONTENT_INVALID = 2803,
  IM_ROOM_NOT_FOUND = 2804,
  IM_ROOM_JOIN_FAILED = 2805,
  IM_ROOM_LEAVE_FAILED = 2806,
  IM_BLACKLIST_EXISTS = 2807,
  IM_MUTE_FAILED = 2808,

  // ==================== 保险模块 (INS 2900-2999) ====================
  INS_NOT_FOUND = 2901,
  INS_PRODUCT_NOT_FOUND = 2902,
  INS_POLICY_NOT_FOUND = 2903,
  INS_POLICY_EXPIRED = 2904,
  INS_CLAIM_FAILED = 2905,
  INS_CLAIM_AMOUNT_EXCEED = 2906,
  INS_COMPANY_NOT_FOUND = 2907,
  INS_HOLDER_NOT_FOUND = 2908,

  // ==================== 内容模块 (CONTENT 3000-3099) ====================
  CONTENT_NOT_FOUND = 3001,
  CONTENT_CATEGORY_NOT_FOUND = 3002,
  CONTENT_TAG_NOT_FOUND = 3003,
  CONTENT_PUBLISH_FAILED = 3004,
  CONTENT审核_FAILED = 3005,
  CONTENT_REJECT_REASON_REQUIRED = 3006,

  // ==================== 钱包模块 (WALLET 3100-3199) ====================
  WALLET_NOT_FOUND = 3101,
  WALLET_BALANCE_INSUFFICIENT = 3102,
  WALLET_FROZEN_AMOUNT_INVALID = 3103,
  WALLET_TRANSFER_FAILED = 3104,
  WALLET_RECHARGE_FAILED = 3105,
  WALLET_WITHDRAW_FAILED = 3106,
  WALLET_FROZEN_FAILED = 3107,
  WALLET_UNFROZEN_FAILED = 3108,

  // ==================== 促销模块 (PROMO 3200-3299) ====================
  PROMO_NOT_FOUND = 3201,
  PROMO_EXPIRED = 3202,
  PROMO_NOT_STARTED = 3203,
  PROMO_CONDITION_NOT_MET = 3204,
  PROMO_GOODS_NOT_INCLUDED = 3205,
  PROMO_LIMIT_EXCEEDED = 3206,
  PROMO_STACK_NOT_ALLOWED = 3207,
  PROMO_ORDER_NOT_APPLY = 3208,

  // ==================== 系统模块 (SYS 3300-3399) ====================
  SYS_CONFIG_NOT_FOUND = 3301,
  SYS_CONFIG_INVALID = 3302,
  SYS_MAINTENANCE_MODE = 3303,
  SYS_API_RATE_LIMIT = 3304,
  SYS_IP_BLACKLIST = 3305,
  SYS_FEATURE_DISABLED = 3306,
  SYS_VERSION_INCOMPATIBLE = 3307,
  SYS_DATABASE_ERROR = 3308,
  SYS_REDIS_ERROR = 3309,
  SYS_EXTERNAL_SERVICE_ERROR = 3310,
}

export const ErrorCodeMessages: Record<number, string> = {
  // 通用
  [ErrorCode.GLO_SUCCESS]: '成功',
  [ErrorCode.GLO_BAD_REQUEST]: '请求参数错误',
  [ErrorCode.GLO_UNAUTHORIZED]: '未授权，请先登录',
  [ErrorCode.GLO_FORBIDDEN]: '无权访问',
  [ErrorCode.GLO_NOT_FOUND]: '资源不存在',
  [ErrorCode.GLO_CONFLICT]: '资源冲突',
  [ErrorCode.GLO_VALIDATION_FAILED]: '数据验证失败',
  [ErrorCode.GLO_INTERNAL_ERROR]: '服务器内部错误',
  [ErrorCode.GLO_SERVICE_UNAVAILABLE]: '服务暂不可用',
  [ErrorCode.GLO_TIMEOUT]: '请求超时',
  [ErrorCode.GLO_TOO_MANY_REQUESTS]: '请求过于频繁，请稍后重试',
  [ErrorCode.GLO_LOCKED]: '资源已被锁定',
  [ErrorCode.GLO_METHOD_NOT_ALLOWED]: '请求方法不支持',

  // 用户
  [ErrorCode.USR_NOT_FOUND]: '用户不存在',
  [ErrorCode.USR_ALREADY_EXISTS]: '用户已存在',
  [ErrorCode.USR_DISABLED]: '用户已被禁用',
  [ErrorCode.USR_PASSWORD_ERROR]: '密码错误',
  [ErrorCode.USR_PASSWORD_WEAK]: '密码强度不足',
  [ErrorCode.USR_EMAIL_NOT_VERIFIED]: '邮箱未验证',
  [ErrorCode.USR_PHONE_NOT_VERIFIED]: '手机号未验证',
  [ErrorCode.USR_INVALID_TOKEN]: '无效的Token',
  [ErrorCode.USR_TOKEN_EXPIRED]: 'Token已过期',
  [ErrorCode.USR_INSUFFICIENT_PERMISSION]: '权限不足',
  [ErrorCode.USR_ACCOUNT_LOCKED]: '账号已被锁定',
  [ErrorCode.USR_IP_BLOCKED]: 'IP已被封禁',
  [ErrorCode.USR_LOGIN_REQUIRED]: '请先登录',
  [ErrorCode.USR_INFO_INCOMPLETE]: '用户信息不完整',

  // 认证
  [ErrorCode.AUTH_LOGIN_FAILED]: '登录失败',
  [ErrorCode.AUTH_LOGOUT_FAILED]: '退出登录失败',
  [ErrorCode.AUTH_TOKEN_INVALID]: 'Token无效',
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 'Token已过期',
  [ErrorCode.AUTH_REFRESH_TOKEN_INVALID]: '刷新Token无效',
  [ErrorCode.AUTH_CAPTCHA_ERROR]: '验证码错误',
  [ErrorCode.AUTH_CAPTCHA_EXPIRED]: '验证码已过期',
  [ErrorCode.AUTH_CAPTCHA_REQUIRED]: '请输入验证码',
  [ErrorCode.AUTH_SMS_CODE_ERROR]: '短信验证码错误',
  [ErrorCode.AUTH_SMS_CODE_EXPIRED]: '短信验证码已过期',
  [ErrorCode.AUTH_SMS_CODE_SEND_FAILED]: '短信发送失败',
  [ErrorCode.AUTH_SMS_CODE_SEND_TOO_FREQUENT]: '短信发送过于频繁',
  [ErrorCode.AUTH_WECHAT_LOGIN_FAILED]: '微信登录失败',
  [ErrorCode.AUTH_WECHAT_BIND_EXISTS]: '该微信号已绑定其他账号',
  [ErrorCode.AUTH_EMAIL_CODE_ERROR]: '邮箱验证码错误',
  [ErrorCode.AUTH_EMAIL_CODE_EXPIRED]: '邮箱验证码已过期',

  // 订单
  [ErrorCode.ORD_NOT_FOUND]: '订单不存在',
  [ErrorCode.ORD_ALREADY_EXISTS]: '订单已存在',
  [ErrorCode.ORD_STATUS_INVALID]: '订单状态不正确',
  [ErrorCode.ORD_STATUS_CANNOT_CANCEL]: '当前状态无法取消',
  [ErrorCode.ORD_CANCEL_FAILED]: '订单取消失败',
  [ErrorCode.ORD_CREATE_FAILED]: '订单创建失败',
  [ErrorCode.ORD_PAYMENT_PENDING]: '订单待支付',
  [ErrorCode.ORD_REFUND_FAILED]: '退款失败',
  [ErrorCode.ORD_REFUND_AMOUNT_EXCEED]: '退款金额超限',
  [ErrorCode.ORD_ADDRESS_INVALID]: '收货地址无效',
  [ErrorCode.ORD_GOODS_CHANGED]: '商品信息已变更',
  [ErrorCode.ORD_GOODS_STOCK_INSUFFICIENT]: '商品库存不足',
  [ErrorCode.ORD_PRICE_CHANGED]: '商品价格已变更',

  // 商品
  [ErrorCode.GDS_NOT_FOUND]: '商品不存在',
  [ErrorCode.GDS_STOCK_INSUFFICIENT]: '商品库存不足',
  [ErrorCode.GDS_OFFLINE]: '商品已下架',
  [ErrorCode.GDS_NOT_ON_SALE]: '商品未在售',
  [ErrorCode.GDS_CATEGORY_NOT_FOUND]: '商品分类不存在',
  [ErrorCode.GDS_SKU_NOT_FOUND]: '商品SKU不存在',
  [ErrorCode.GDS_SKU_DISABLED]: '商品SKU已禁用',
  [ErrorCode.GDS_BRAND_NOT_FOUND]: '商品品牌不存在',
  [ErrorCode.GDS_IMAGE_UPLOAD_FAILED]: '商品图片上传失败',
  [ErrorCode.GDS_FAVORITE_EXISTS]: '商品已收藏',
  [ErrorCode.GDS_FAVORITE_NOT_FOUND]: '商品未收藏',

  // 购物车
  [ErrorCode.CART_NOT_FOUND]: '购物车为空',
  [ErrorCode.CART_ITEM_NOT_FOUND]: '购物车商品不存在',
  [ErrorCode.CART_STOCK_INSUFFICIENT]: '购物车商品库存不足',
  [ErrorCode.CART_GOODS_OFFLINE]: '购物车商品已下架',
  [ErrorCode.CART_GOODS_NOT_FOUND]: '购物车商品不存在',
  [ErrorCode.CART_LIMIT_EXCEEDED]: '购物车商品数量超限',
  [ErrorCode.CART_EMPTY]: '购物车为空',

  // 支付
  [ErrorCode.PAY_FAILED]: '支付失败',
  [ErrorCode.PAY_AMOUNT_INVALID]: '支付金额无效',
  [ErrorCode.PAY_TIMEOUT]: '支付超时',
  [ErrorCode.PAY_CANCELLED]: '支付已取消',
  [ErrorCode.PAY_ALREADY_PAID]: '订单已支付',
  [ErrorCode.PAY_METHOD_INVALID]: '支付方式无效',
  [ErrorCode.PAY_WECHAT_FAILED]: '微信支付失败',
  [ErrorCode.PAY_ALIPAY_FAILED]: '支付宝支付失败',
  [ErrorCode.PAY_BALANCE_INSUFFICIENT]: '余额不足',
  [ErrorCode.PAY_SIGN_FAILED]: '支付签名失败',
  [ErrorCode.PAY_ORDER_NOT_FOUND]: '支付订单不存在',
  [ErrorCode.PAY_CALLBACK_INVALID]: '支付回调签名无效',
  [ErrorCode.PAY_REFUND_FAILED]: '退款失败',
  [ErrorCode.PAY_CHANNEL_UNAVAILABLE]: '支付渠道不可用',

  // 物流
  [ErrorCode.LOG_NOT_FOUND]: '物流信息不存在',
  [ErrorCode.LOG_COMPANY_NOT_FOUND]: '物流公司不存在',
  [ErrorCode.LOG_TRACKING_FAILED]: '物流追踪失败',
  [ErrorCode.LOG_ADDRESS_INVALID]: '收货地址无效',
  [ErrorCode.LOG_SHIPPING_FAILED]: '发货失败',
  [ErrorCode.LOG_TRACKING_NOT_FOUND]: '物流追踪信息不存在',
  [ErrorCode.LOG_COMPANY_UNSUPPORTED]: '不支持的物流公司',

  // 分销
  [ErrorCode.DIS_NOT_FOUND]: '分销商不存在',
  [ErrorCode.DIS_ALREADY_EXISTS]: '已是分销商',
  [ErrorCode.DIS_INVITE_CODE_INVALID]: '邀请码无效',
  [ErrorCode.DIS_INVITE_CODE_EXPIRED]: '邀请码已过期',
  [ErrorCode.DIS_COMMISSION_FAILED]: '佣金计算失败',
  [ErrorCode.DIS_WITHDRAW_FAILED]: '提现失败',
  [ErrorCode.DIS_WITHDRAW_AMOUNT_INVALID]: '提现金额无效',
  [ErrorCode.DIS_WITHDRAW_AMOUNT_TOO_LOW]: '提现金额低于最低限制',
  [ErrorCode.DIS_WITHDRAW_ALREADY_PROCESSING]: '提现处理中',
  [ErrorCode.DIS_LEVEL_INVALID]: '分销等级无效',
  [ErrorCode.DIS_BIND_SELF]: '不能绑定自己',
  [ErrorCode.COMMISSION_NOT_FOUND]: '佣金记录不存在',

  // 优惠券
  [ErrorCode.CPN_NOT_FOUND]: '优惠券不存在',
  [ErrorCode.CPN_ALREADY_USED]: '优惠券已使用',
  [ErrorCode.CPN_EXPIRED]: '优惠券已过期',
  [ErrorCode.CPN_NOT_STARTED]: '优惠券未开始',
  [ErrorCode.CPN_CONDITION_NOT_MET]: '不满足优惠券使用条件',
  [ErrorCode.CPN_LIMIT_EXCEEDED]: '优惠券领取次数超限',
  [ErrorCode.CPN_ALREADY_RECEIVED]: '优惠券已领取',
  [ErrorCode.CPN_INSUFFICIENT_STOCK]: '优惠券库存不足',

  // 仓库
  [ErrorCode.INV_NOT_FOUND]: '库存记录不存在',
  [ErrorCode.INV_STOCK_INSUFFICIENT]: '库存不足',
  [ErrorCode.INV_STOCK_LOCKED]: '库存已锁定',
  [ErrorCode.INV_STOCK_ERROR]: '库存数据异常',
  [ErrorCode.INV_LOCATION_NOT_FOUND]: '库位不存在',

  // 店铺
  [ErrorCode.STORE_NOT_FOUND]: '店铺不存在',
  [ErrorCode.STORE_ALREADY_EXISTS]: '店铺已存在',
  [ErrorCode.STORE_DISABLED]: '店铺已被禁用',
  [ErrorCode.STORE_NAME_DUPLICATE]: '店铺名称重复',

  // 售后
  [ErrorCode.AFS_NOT_FOUND]: '售后单不存在',
  [ErrorCode.AFS_ALREADY_EXISTS]: '售后单已存在',
  [ErrorCode.AFS_STATUS_INVALID]: '售后状态不正确',
  [ErrorCode.AFS_REASON_REQUIRED]: '请选择售后原因',
  [ErrorCode.AFS_EVIDENCE_REQUIRED]: '请上传凭证',
  [ErrorCode.AFS_REFUND_EXCEED]: '退款金额超限',

  // 评价
  [ErrorCode.REVIEW_NOT_FOUND]: '评价不存在',
  [ErrorCode.REVIEW_ALREADY_EXISTS]: '已评价',
  [ErrorCode.REVIEW_CONTENT_INVALID]: '评价内容无效',

  // 消息
  [ErrorCode.MSG_SEND_FAILED]: '消息发送失败',
  [ErrorCode.MSG_TEMPLATE_NOT_FOUND]: '消息模板不存在',
  [ErrorCode.MSG_RATE_LIMIT_EXCEEDED]: '消息发送频率超限',

  // 微信
  [ErrorCode.WECHAT_LOGIN_FAILED]: '微信登录失败',
  [ErrorCode.WECHAT_USER_NOT_FOUND]: '微信用户不存在',
  [ErrorCode.WECHAT_TEMPLATE_SEND_FAILED]: '微信模板消息发送失败',

  // 文件
  [ErrorCode.FILE_NOT_FOUND]: '文件不存在',
  [ErrorCode.FILE_UPLOAD_FAILED]: '文件上传失败',
  [ErrorCode.FILE_TYPE_INVALID]: '文件类型不支持',
  [ErrorCode.FILE_SIZE_EXCEEDED]: '文件大小超限',
  [ErrorCode.FILE_IMAGE_INVALID]: '图片格式无效',

  // 直播
  [ErrorCode.LIVE_NOT_FOUND]: '直播不存在',
  [ErrorCode.LIVE_ROOM_NOT_FOUND]: '直播间不存在',
  [ErrorCode.LIVE_ROOM_DISABLED]: '直播间已禁用',
  [ErrorCode.LIVE_STREAM_FAILED]: '直播推流失败',

  // IM
  [ErrorCode.IM_USER_NOT_FOUND]: 'IM用户不存在',
  [ErrorCode.IM_MESSAGE_SEND_FAILED]: '消息发送失败',
  [ErrorCode.IM_ROOM_NOT_FOUND]: '聊天室不存在',

  // 保险
  [ErrorCode.INS_NOT_FOUND]: '保险产品不存在',
  [ErrorCode.INS_POLICY_NOT_FOUND]: '保单不存在',
  [ErrorCode.INS_POLICY_EXPIRED]: '保单已过期',
  [ErrorCode.INS_CLAIM_FAILED]: '理赔失败',

  // 内容
  [ErrorCode.CONTENT_NOT_FOUND]: '内容不存在',
  [ErrorCode.CONTENT_CATEGORY_NOT_FOUND]: '内容分类不存在',
  [ErrorCode.CONTENT_PUBLISH_FAILED]: '内容发布失败',

  // 钱包
  [ErrorCode.WALLET_NOT_FOUND]: '钱包不存在',
  [ErrorCode.WALLET_BALANCE_INSUFFICIENT]: '钱包余额不足',
  [ErrorCode.WALLET_TRANSFER_FAILED]: '转账失败',
  [ErrorCode.WALLET_RECHARGE_FAILED]: '充值失败',
  [ErrorCode.WALLET_WITHDRAW_FAILED]: '提现失败',

  // 促销
  [ErrorCode.PROMO_NOT_FOUND]: '促销活动不存在',
  [ErrorCode.PROMO_EXPIRED]: '促销活动已过期',
  [ErrorCode.PROMO_NOT_STARTED]: '促销活动未开始',
  [ErrorCode.PROMO_CONDITION_NOT_MET]: '不满足促销条件',

  // 系统
  [ErrorCode.SYS_CONFIG_NOT_FOUND]: '系统配置不存在',
  [ErrorCode.SYS_CONFIG_INVALID]: '系统配置无效',
  [ErrorCode.SYS_MAINTENANCE_MODE]: '系统维护中',
  [ErrorCode.SYS_API_RATE_LIMIT]: 'API请求频率超限',
  [ErrorCode.SYS_FEATURE_DISABLED]: '功能未启用',
  [ErrorCode.SYS_DATABASE_ERROR]: '数据库错误',
  [ErrorCode.SYS_REDIS_ERROR]: '缓存服务错误',
  [ErrorCode.SYS_EXTERNAL_SERVICE_ERROR]: '外部服务调用失败',
};

export function getErrorMessage(code: number): string {
  return ErrorCodeMessages[code] || '未知错误';
}

export function getErrorCodeModule(code: number): string {
  if (code >= 3300) return '系统模块';
  if (code >= 3200) return '促销模块';
  if (code >= 3100) return '钱包模块';
  if (code >= 3000) return '内容模块';
  if (code >= 2900) return '保险模块';
  if (code >= 2800) return 'IM模块';
  if (code >= 2700) return '直播模块';
  if (code >= 2600) return '文件模块';
  if (code >= 2500) return '微信模块';
  if (code >= 2400) return '消息模块';
  if (code >= 2300) return '评价模块';
  if (code >= 2200) return '售后模块';
  if (code >= 2100) return '店铺模块';
  if (code >= 2000) return '仓库模块';
  if (code >= 1900) return '优惠券模块';
  if (code >= 1800) return '分销模块';
  if (code >= 1700) return '物流模块';
  if (code >= 1600) return '支付模块';
  if (code >= 1500) return '购物车模块';
  if (code >= 1400) return '商品模块';
  if (code >= 1300) return '订单模块';
  if (code >= 1200) return '会员模块';
  if (code >= 1100) return '认证模块';
  if (code >= 1000) return '用户模块';
  return '通用模块';
}
