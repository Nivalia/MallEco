import { Module, Global } from '@nestjs/common';
import { GraphQLConfig } from './graphql.config';

/**
 * GraphQL 模块
 *
 * 使用方法:
 * 1. 安装依赖: npm install @nestjs/graphql @nestjs/apollo graphql apollo-server-express
 * 2. 在模块中启用:
 *
 * import { GraphQLModule } from '@nestjs/graphql';
 * import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
 *
 * @Module({
 *   imports: [
 *     GraphQLModule.forRoot<ApolloDriverConfig>({
 *       driver: ApolloDriver,
 *       autoSchemaFile: true,
 *     }),
 *   ],
 * })
 *
 * @Global()
 * @Module({
 *   imports: [GraphQLBaseModule],
 * })
 * export class GraphQLModule {}
 */
@Global()
@Module({
  providers: [
    {
      provide: 'GRAPHQL_CONFIG',
      useValue: GraphQLConfig,
    },
  ],
  exports: ['GRAPHQL_CONFIG'],
})
export class GraphQLBaseModule {}
