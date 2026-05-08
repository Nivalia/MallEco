import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new BadRequestException(`Validation failed for ${metadata.data}`);
    }
    return parsed;
  }
}

@Injectable()
export class ParseBoolPipe implements PipeTransform<string, boolean> {
  transform(value: string, metadata: ArgumentMetadata): boolean {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    throw new BadRequestException(`Validation failed for ${metadata.data}`);
  }
}

@Injectable()
export class DefaultValuePipe implements PipeTransform<any, any> {
  constructor(private defaultValue: any) {}

  transform(value: any): any {
    return value !== undefined && value !== null && value !== '' ? value : this.defaultValue;
  }
}

@Injectable()
export class EnumPipe<T> implements PipeTransform<string, T> {
  constructor(private enumType: T) {}

  transform(value: string): any {
    const enumValues = Object.values(this.enumType);
    if (!enumValues.includes(value as any)) {
      throw new BadRequestException(`Invalid enum value: ${value}`);
    }
    return value as any;
  }
}
