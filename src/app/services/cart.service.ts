import { Injectable } from '@angular/core';
import { EndpointBase } from './endpoint-base.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AppConfigurationService } from './configuration.service';
import { BehaviorSubject, catchError, map, Observable } from 'rxjs';
import {
  CartItem,
  GetCartByUserResponse,
  InsertUpdateCartResponse,
} from '../models/cart.model';
import { BaseResponse } from '../models/base.model';

@Injectable({
  providedIn: 'root',
})
export class CartService extends EndpointBase {
  API_URL: string = '';

  // Trạng thái của cart
  public cartDataSource = new BehaviorSubject<CartItem[]>([]);
  cartData$ = this.cartDataSource.asObservable();

  // Trạng thái tổng số lượng sản phẩm trong giỏ hàng
  public totalQuantitySubject = new BehaviorSubject<number>(0);
  totalQuantity$ = this.totalQuantitySubject.asObservable();

  // Trạng thái tổng tiền trong giỏ hàng
  public totalAmountSubject = new BehaviorSubject<number>(0);
  totalAmount$ = this.totalAmountSubject.asObservable();

  constructor(
    http: HttpClient,
    authService: AuthService,
    private appConfig: AppConfigurationService
  ) {
    super(http, authService);
    this.API_URL = appConfig['API_URL'];
  }

  reset(): void {
    this.cartDataSource.next([]);
    this.totalQuantitySubject.next(0);
    this.totalAmountSubject.next(0);
  }

  insertUpdateCart(
    flowerListingId: number,
    quantity: number
  ): Observable<InsertUpdateCartResponse> {
    return this.http
      .post<InsertUpdateCartResponse>(
        `${this.API_URL}/cart/insert-update`,
        {
          flowerListingId,
          quantity,
        },
        this.requestHeaders
      )
      .pipe(
        // Nếu insert hoặc update thành công, cập nhật giỏ hàng và tổng số lượng
        map((response: InsertUpdateCartResponse) => {
          if (response.success && response.code === 200 && response.data) {
            this.updateCart(response.data); // Cập nhật danh sách giỏ hàng
          }
          return response;
        }),
        catchError((error) => {
          return this.handleError(error, () =>
            this.insertUpdateCart(flowerListingId, quantity)
          );
        })
      );
  }

  getCartByUser(): Observable<GetCartByUserResponse> {
    return this.http
      .get<GetCartByUserResponse>(
        `${this.API_URL}/cart/get-by-user`,
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.getCartByUser());
        })
      );
  }

  removeCartItemById(id: number): Observable<BaseResponse<null>> {
    return this.http
      .delete<BaseResponse<null>>(
        `${this.API_URL}/cart/remove/${id}`,
        this.requestHeaders
      )
      .pipe(
        map((response) => {
          if (response.code === 200) {
            // Cập nhật lại giỏ hàng sau khi xoá thành công
            const currentCart = this.cartDataSource.getValue();
            const updatedCart = currentCart.filter(
              (item: CartItem) => item.id !== id
            );
            this.cartDataSource.next(updatedCart);
            this.updateTotalQuantity(updatedCart);
            this.updateTotalAmount(updatedCart);
          }
          return response;
        }),
        catchError((error) => {
          return this.handleError(error, () => this.removeCartItemById(id));
        })
      );
  }

  clearCart(): Observable<BaseResponse<any>> {
    return this.http
      .delete<BaseResponse<any>>(
        `${this.API_URL}/cart/clear`,
        this.requestHeaders
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error, () => this.clearCart());
        })
      );
  }
  // Cập nhật danh sách giỏ hàng và tính lại tổng số lượng
  updateCart(updatedItem: CartItem): void {
    const currentCart = this.cartDataSource.getValue();
    const existingItemIndex = currentCart.findIndex(
      (item: CartItem) => item.flowerId === updatedItem.flowerId
    );

    if (existingItemIndex >= 0) {
      // Nếu sản phẩm đã tồn tại, cập nhật số lượng
      currentCart[existingItemIndex] = updatedItem;
    } else {
      // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới
      currentCart.push(updatedItem);
    }

    // Cập nhật lại BehaviorSubject với giỏ hàng mới
    this.cartDataSource.next(currentCart);
    this.updateTotalQuantity(currentCart); // Cập nhật tổng số lượng
    this.updateTotalAmount(currentCart); // Cập nhật tổng tiền
  }

  // Tính tổng số lượng sản phẩm trong giỏ hàng
  updateTotalQuantity(cartItems: CartItem[]): void {
    const totalQuantity = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    this.totalQuantitySubject.next(totalQuantity); // Phát ra giá trị mới cho tổng số lượng
  }

  // Tính tổng tiền trong giỏ hàng
  updateTotalAmount(cartItems: CartItem[]): void {
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.flowerPrice * item.quantity, // Giả sử `price` là giá của từng sản phẩm
      0
    );
    this.totalAmountSubject.next(totalAmount); // Phát ra giá trị mới cho tổng tiền
  }
}
