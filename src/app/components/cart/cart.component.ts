import { CartItem, InsertUpdateCartResponse } from './../../models/cart.model';
import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    TranslateModule,
    CommonModule,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  listCartItem: CartItem[] = []; // Danh sách sản phẩm trong giỏ hàng
  totalAmount: number = 0; // Tổng tiền trong giỏ hàng

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);

    this.cartService.cartDataSource.subscribe((cartData: CartItem[]) => {
      if (cartData) {
        this.listCartItem = cartData;
      }
    });
    this.cartService.totalAmountSubject.subscribe(
      (totalAmount: number) => (this.totalAmount = totalAmount)
    );
  }

  // Thêm hoặc cập nhật sản phẩm trong giỏ hàng
  btnInsertUpdateCart(flowerId: number, quantity: number) {
    this.cartService.insertUpdateCart(flowerId, quantity).subscribe({
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }

  btnRemoveCartItem(cartItemId: number) {
    this.cartService.removeCartItemById(cartItemId).subscribe({
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }

  btnClearCart() {
    this.cartService.clearCart().subscribe({
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }
}
