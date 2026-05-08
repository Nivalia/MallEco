/**
 * GraphQL 配置
 */
export interface GraphQLConfig {
  /**
   * 是否启用
   */
  enabled: boolean;

  /**
   * Playground 是否启用
   */
  playground: boolean;

  /**
   * 是否调试
   */
  debug: boolean;

  /**
   * 路径
   */
  path: string;

  /**
   * Playground 路径
   */
  playgroundPath: string;
}

export const GraphQLConfig: GraphQLConfig = {
  enabled: false,
  playground: true,
  debug: process.env.NODE_ENV === 'development',
  path: '/graphql',
  playgroundPath: '/graphql/playground',
};
