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
}
