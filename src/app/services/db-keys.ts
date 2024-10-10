import { Injectable } from '@angular/core';

@Injectable()
export class DBkeys {
  public static readonly CURRENT_USER = 'current_user';
  public static readonly ACCESS_TOKEN = 'access_token';
  public static readonly REFRESH_TOKEN = 'refresh_token';
  public static readonly TOKEN_EXPIRES_IN = 'expires_in';
  public static readonly LANG_ID = 'lang_id';
  public static readonly CURRENT_PRODUCTS_PAGE = 'current_products_page';
  public static readonly DEFAULT_LANG = 'default_lang';
}
