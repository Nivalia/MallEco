/**
 * 通用状态枚举
 */
export enum StatusEnum {
  DISABLE = 0,
  ENABLE = 1,
}

/**
 * 删除状态枚举
 */
export enum DeleteStatusEnum {
  NOT_DELETED = 0,
  DELETED = 1,
}

/**
 * 是否枚举
 */
export enum YesNoEnum {
  NO = 0,
  YES = 1,
}

/**
 * 订单状态枚举
 */
export enum OrderStatusEnum {
  PENDING = 0, // 待支付
  PAID = 1, // 已支付
  SHIPPED = 2, // 已发货
  RECEIVED = 3, // 已收货
  COMPLETED = 4, // 已完成
  CANCELLED = 5, // 已取消
  REFUNDING = 6, // 退款中
  REFUNDED = 7, // 已退款
}

/**
 * 支付状态枚举
 */
export enum PaymentStatusEnum {
  PENDING = 0, // 待支付
  PAID = 1, // 已支付
  FAILED = 2, // 支付失败
  REFUNDED = 3, // 已退款
  CANCELLED = 4, // 已取消
}

/**
 * 配送状态枚举
 */
export enum ShippingStatusEnum {
  PENDING = 0, // 待发货
  SHIPPED = 1, // 已发货
  IN_TRANSIT = 2, // 运输中
  DELIVERED = 3, // 已送达
  SIGNED = 4, // 已签收
}

/**
 * 用户状态枚举
 */
export enum UserStatusEnum {
  NORMAL = 0, // 正常
  DISABLED = 1, // 禁用
  LOCKED = 2, // 锁定
  DELETED = 3, // 已删除
}

/**
 * 审核状态枚举
 */
export enum AuditStatusEnum {
  PENDING = 0, // 待审核
  APPROVED = 1, // 已通过
  REJECTED = 2, // 已拒绝
}

/**
 * 优惠券状态枚举
 */
export enum CouponStatusEnum {
  NOT_STARTED = 0, // 未开始
  ACTIVE = 1, // 活动中
  EXPIRED = 2, // 已过期
  USED = 3, // 已使用
}

/**
 * 分销商状态枚举
 */
export enum DistributorStatusEnum {
  PENDING = 0, // 待审核
  ACTIVE = 1, // 有效
  DISABLED = 2, // 禁用
  FROZEN = 3, // 冻结
}

/**
 * 提现状态枚举
 */
export enum WithdrawStatusEnum {
  PENDING = 0, // 待审核
  APPROVED = 1, // 已通过
  REJECTED = 2, // 已拒绝
  PROCESSING = 3, // 处理中
  COMPLETED = 4, // 已完成
  FAILED = 5, // 失败
}
