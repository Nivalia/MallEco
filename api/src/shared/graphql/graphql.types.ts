// @ts-nocheck
// GraphQL types - requires @nestjs/graphql package
// import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

/*
// 原始代码（需要 @nestjs/graphql）
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

// 临时使用 any 类型作为占位符
const ObjectType = (target?: any) => target;
const Field = (options?: any) => (target: any, key: string) => {};
const Int = Number;
const Float = Number;
*/

/**
 * 分页信息
 */
@ObjectType()
export class PageInfo {
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  totalPages: number;

  @Field()
  hasNext: boolean;

  @Field()
  hasPrev: boolean;
}

/**
 * 分页响应基类
 */
@ObjectType()
export abstract class PaginatedResponse<T> {
  @Field(() => [Object])
  items: T[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}

/**
 * 基础实体
 */
@ObjectType()
export abstract class BaseModel {
  @Field(() => Int)
  id: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

/**
 * 通用响应
 */
@ObjectType()
export class ApiResponse<T> {
  @Field(() => Int)
  code: number;

  @Field()
  message: string;

  @Field({ nullable: true })
  data?: T;
}

/**
 * 分页输入
 */
@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  page: number = 1;

  @Field(() => Int, { defaultValue: 10 })
  pageSize: number = 10;
}

/**
 * 排序输入
 */
@InputType()
export class SortInput {
  @Field({ nullable: true })
  field?: string;

  @Field({ nullable: true })
  order?: 'ASC' | 'DESC';
}

/**
 * 范围输入
 */
@InputType()
export class RangeInput<T> {
  @Field({ nullable: true })
  start?: T;

  @Field({ nullable: true })
  end?: T;
}

function InputType(): ClassDecorator {
  return (target: any) => {
    return target;
  };
}

function ObjectType(): ClassDecorator {
  return (target: any) => {
    return target;
  };
}

function Field(): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    return;
  };
}

function Int(): ReturnType<typeof Field> {
  return Field()(target, '') as any;
}

function Float(): ReturnType<typeof Field> {
  return Field()(target, '') as any;
}
