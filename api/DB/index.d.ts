/**
 * DB 模块类型声明
 */

import { DatabaseManager } from '../src/types/database-manager';

export { DatabaseManager };

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
