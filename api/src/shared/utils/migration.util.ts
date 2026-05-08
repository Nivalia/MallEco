import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableColumn,
  TableIndex,
  TableOptions,
} from 'typeorm';

/**
 * 基础迁移类
 * 提供常用的迁移方法
 */
export abstract class BaseMigration implements MigrationInterface {
  abstract tableName: string;
  abstract table: Table;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async up(queryRunner: QueryRunner): Promise<void> {
    // 由子类实现
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async down(queryRunner: QueryRunner): Promise<void> {
    // 由子类实现
  }

  /**
   * 创建表
   */
  async createTable(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.table as Table, true);
  }

  /**
   * 删除表
   */
  async dropTable(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName, true);
  }

  /**
   * 添加字段
   */
  async addColumn(
    queryRunner: QueryRunner,
    columnName: string,
    columnDefinition: any,
  ): Promise<void> {
    await queryRunner.addColumn(
      this.tableName,
      new TableColumn({ name: columnName, ...columnDefinition }),
    );
  }

  /**
   * 删除字段
   */
  async dropColumn(queryRunner: QueryRunner, columnName: string): Promise<void> {
    await queryRunner.dropColumn(this.tableName, columnName);
  }
  async addForeignKey(
    queryRunner: QueryRunner,
    name: string,
    columnName: string,
    referencedTableName: string,
    referencedColumnName: string,
    onDelete: 'CASCADE' | 'SET NULL' | 'NO ACTION' = 'CASCADE',
  ): Promise<void> {
    await queryRunner.createForeignKey(
      this.tableName,
      new TableForeignKey({
        name,
        columnNames: [columnName],
        referencedTableName,
        referencedColumnNames: [referencedColumnName],
        onDelete,
      }),
    );
  }

  /**
   * 删除外键
   */
  async dropForeignKey(queryRunner: QueryRunner, name: string): Promise<void> {
    await queryRunner.dropForeignKey(this.tableName, name);
  }

  /**
   * 添加索引
   */
  async createIndex(
    queryRunner: QueryRunner,
    name: string,
    columnNames: string[],
    isUnique: boolean = false,
  ): Promise<void> {
    await queryRunner.createIndex(
      this.tableName,
      new TableIndex({
        name,
        columnNames,
        isUnique,
      }),
    );
  }

  /**
   * 删除索引
   */
  async dropIndex(queryRunner: QueryRunner, name: string): Promise<void> {
    await queryRunner.dropIndex(this.tableName, name);
  }

  /**
   * 检查表是否存在
   */
  async isTableExist(queryRunner: QueryRunner): Promise<boolean> {
    const table = await queryRunner.getTable(this.tableName);
    return !!table;
  }

  /**
   * 检查列是否存在
   */
  async isColumnExist(queryRunner: QueryRunner, columnName: string): Promise<boolean> {
    const table = await queryRunner.getTable(this.tableName);
    return table?.columns.some(col => col.name === columnName) || false;
  }

  /**
   * 检查索引是否存在
   */
  async isIndexExist(queryRunner: QueryRunner, indexName: string): Promise<boolean> {
    const table = await queryRunner.getTable(this.tableName);
    return table?.indices.some(idx => idx.name === indexName) || false;
  }
}

/**
 * 常用列定义
 */
export const CommonColumns = {
  /**
   * ID 列 - 自增
   */
  id: {
    name: 'id',
    type: 'bigint',
    isPrimary: true,
    isGenerated: true,
    generationStrategy: 'increment',
  },

  /**
   * ID 列 - UUID
   */
  uuidId: {
    name: 'id',
    type: 'varchar',
    length: '36',
    isPrimary: true,
  },

  /**
   * 创建时间
   */
  createdAt: {
    name: 'created_at',
    type: 'datetime',
    default: 'CURRENT_TIMESTAMP',
  },

  /**
   * 更新时间
   */
  updatedAt: {
    name: 'updated_at',
    type: 'datetime',
    default: 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  },

  /**
   * 删除时间 (软删除)
   */
  deletedAt: {
    name: 'deleted_at',
    type: 'datetime',
    isNullable: true,
  },

  /**
   * 创建者ID
   */
  createdBy: {
    name: 'created_by',
    type: 'varchar',
    length: '36',
    isNullable: true,
  },

  /**
   * 更新者ID
   */
  updatedBy: {
    name: 'updated_by',
    type: 'varchar',
    length: '36',
    isNullable: true,
  },

  /**
   * 状态
   */
  status: {
    name: 'status',
    type: 'tinyint',
    default: 1,
  },

  /**
   * 排序
   */
  sortOrder: {
    name: 'sort_order',
    type: 'int',
    default: 0,
  },

  /**
   * 备注
   */
  remark: {
    name: 'remark',
    type: 'varchar',
    length: '500',
    isNullable: true,
  },
};

/**
 * 常用索引名称
 */
export const CommonIndexes = {
  idx_status: 'idx_status',
  idx_created_at: 'idx_created_at',
  idx_updated_at: 'idx_updated_at',
  idx_status_created_at: 'idx_status_created_at',
};
