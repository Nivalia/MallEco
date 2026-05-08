/**
 * DatabaseManager 类型定义
 * 用于 DB/index.js 中的 DatabaseManager 类
 */

export class DatabaseManager {
  private config: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    charset: string;
  };

  constructor();

  initialize(): Promise<void>;

  checkConnection(): Promise<boolean>;

  getDatabaseInfo(): Promise<{
    host: string;
    port: number;
    database: string;
    version: string;
    tables: number;
  }>;
}

export const databaseManager: DatabaseManager;

export function initializeDatabase(): Promise<void>;

export function checkDatabaseConnection(): Promise<boolean>;

export function getDatabaseInfo(): Promise<{
  host: string;
  port: number;
  database: string;
  version: string;
  tables: number;
}>;
