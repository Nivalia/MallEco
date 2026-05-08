export class EntityFieldMapper {
  static toSnakeCase<T extends Record<string, any>>(obj: T): Record<string, any> {
    const result: Record<string, any> = {};
    for (const key in obj) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = obj[key];
    }
    return result;
  }

  static toCamelCase<T extends Record<string, any>>(obj: T): Record<string, any> {
    const result: Record<string, any> = {};
    for (const key in obj) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = obj[key];
    }
    return result;
  }

  static mapFields<T extends Record<string, any>>(
    obj: T,
    fromSnakeToCamel: boolean = true,
  ): Record<string, any> {
    return fromSnakeToCamel ? this.toCamelCase(obj) : this.toSnakeCase(obj);
  }
}

export const FIELD_MAPPING = {
  id: 'id',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  isDeleted: 'is_deleted',
  createTime: 'create_time',
  updateTime: 'update_time',
  isDel: 'is_del',
};
