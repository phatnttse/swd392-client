import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'typeTransform',
  standalone: true,
})
export class TypeTransformPipe implements PipeTransform {
  transform(value: any, entityType: string): any {
    switch (entityType) {
      case 'ParentCategory':
        return this.convertParentCategory(value);
      default:
        return value;
    }
  }

  private convertParentCategory(value: string): string {
    switch (value) {
      case 'COLOR':
        return 'Màu sắc';
      case 'TYPE':
        return 'Loại';
      case 'EVENT_TYPE':
        return 'Loại sự kiện';
      case 'SUBJECT':
        return 'Chủ đề';
      case 'DISPLAY':
        return 'Trưng bày';
      default:
        return value;
    }
  }
}
