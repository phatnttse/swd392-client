import { Injectable } from '@angular/core';

@Injectable()
export class Utilities {
  public static JsonTryParse(value: string) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  public static splitInTwo(
    text: string,
    separator: string,
    splitFromEnd = false
  ): { firstPart: string; secondPart: string | undefined } {
    let separatorIndex = -1;

    if (separator !== '') {
      if (!splitFromEnd) separatorIndex = text.indexOf(separator);
      else separatorIndex = text.lastIndexOf(separator);
    }

    if (separatorIndex === -1) {
      return { firstPart: text, secondPart: undefined };
    }

    const part1 = text.substring(0, separatorIndex).trim();
    const part2 = text.substring(separatorIndex + 1).trim();

    return { firstPart: part1, secondPart: part2 };
  }

  public static getQueryParamsFromString(paramString: string) {
    const params: { [key: string]: string | undefined } = {};

    for (const param of paramString.split('&')) {
      const keyValue = Utilities.splitInTwo(param, '=');
      params[keyValue.firstPart] = keyValue.secondPart;
    }

    return params;
  }

  public static openOffCanvas(id: string) {
    const offcanvas = document.getElementById(id);
    if (offcanvas) {
      const bsOffcanvas = new (window as any).bootstrap.Offcanvas(offcanvas);
      bsOffcanvas.show();
    }
  }
  public static closeOffCanvas(id: string) {
    const offcanvas = document.getElementById(id);
    if (offcanvas) {
      const bsOffcanvas = new (window as any).bootstrap.Offcanvas(offcanvas);
      bsOffcanvas.hide();
    }
  }

  public static formatStringToSlug(string: string): string {
    return string
      .toLowerCase() // Chuyển thành chữ thường
      .replace(/\s+/g, '-') // Thay dấu cách bằng dấu gạch ngang
      .replace(/[^a-zA-Z0-9\-]/g, ''); // Loại bỏ các ký tự đặc biệt
  }

  public static replaceSpacesWithPlus(query: string): string {
    return query.replace(/ /g, '+');
  }

  public static formatDate(date: Date): string {
    // Lấy các giá trị riêng biệt
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0, nên cần cộng 1
    const day = date.getDate().toString().padStart(2, '0');

    // Trả về định dạng yyyy-mm-dd
    return `${year}-${month}-${day}`;
  }
}
