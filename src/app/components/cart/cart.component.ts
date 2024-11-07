import { CartItem, InsertUpdateCartResponse } from './../../models/cart.model';
import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../layouts/header/header.component';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { BreadcrumbComponent } from '../../layouts/breadcrumb/breadcrumb.component';
import { BaseResponse } from '../../models/base.model';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

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
    HeaderComponent,
    FooterComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  listCartItem: CartItem[] = []; // Danh sách sản phẩm trong giỏ hàng
  totalAmount: number = 0; // Tổng tiền trong giỏ hàng

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

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
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/signin']);
      this.toastr.info('Vui lòng đăng nhập', '', { progressBar: true });
      return;
    }
    const cartItem = this.listCartItem.find((x) => x.flowerId === flowerId);
    if (cartItem?.quantity! + quantity === 0) {
      this.btnRemoveCartItem(cartItem?.id!);
    } else {
      this.cartService.insertUpdateCart(flowerId, quantity).subscribe({
        error: (error: HttpErrorResponse) => {
          console.log(error);
        },
      });
    }
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
      next: (response: BaseResponse<any>) => {
        this.cartService.reset();
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }
}
