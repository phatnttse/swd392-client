import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart.model';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { OrderService } from '../../services/order.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { UserAccount } from '../../models/account.model';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { HeaderComponent } from '../../layouts/header/header.component';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { MatBadgeModule } from '@angular/material/badge';
import { PaymentMethod } from '../../models/enums';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    CommonModule,
    MatButtonModule,
    FormsModule,
    MatRadioModule,
    MatIconModule,
    RouterModule,
    TranslateModule,
    HeaderComponent,
    FooterComponent,
    MatBadgeModule,
  ],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss',
})
export class OrderComponent implements OnInit {
  userAccount: UserAccount | null = null;
  orderForm: FormGroup;
  listCartItem: CartItem[] = [];
  totalAmount: number = 0;
  selectedPaymentMethod: string = '';
  statusOrder: number = 0; // 0: Chưa đặt hàng, 1: Đặt hàng thành công, 2: Đặt hàng thất bại
  isBalanceInsufficient: boolean = false; // Kiểm tra số dư ví có đủ để thanh toán không
  isDisabledBtn: boolean = false; // Kiểm tra xem nút đặt hàng có bị disable không
  paymentMethods = PaymentMethod;

  constructor(
    private formBuilder: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.orderForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: [
        '',
        [
          Validators.required,
          // Validators.pattern(/^(84|0[3|5|7|8|9])[0-9]{9}$/),
          Validators.pattern(/(84|0[3|5|7|8|9])+([0-9]{8})\b/g),
        ],
      ],
      deliveryAddress: ['', [Validators.required, Validators.minLength(10)]],
      paymentMethod: ['', Validators.required],
      note: ['', Validators.maxLength(200)],
    });
  }

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
    this.userAccount = this.authService.currentUser;
    this.checkBalance();
  }
  placeOrder() {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      if (this.orderForm.get('paymentMethod')?.invalid) {
        this.toastr.warning(
          'Vui lòng chọn phương thức thanh toán',
          'Đặt hàng thất bại',
          {
            progressBar: true,
          }
        );
      }
      return;
    }
    if (this.totalAmount === 0) {
      this.toastr.warning('Giỏ hàng của bạn đang trống', 'Đặt hàng thất bại', {
        progressBar: true,
      });
      return;
    }
    if (this.userAccount?.balance! < this.totalAmount) {
      this.toastr.warning('Số dư ví của bạn không đủ', 'Đặt hàng thất bại', {
        progressBar: true,
      });
      return;
    }
    const buyerName = this.orderForm.get('name')?.value;
    const buyerAddress = this.orderForm.get('deliveryAddress')?.value;
    const buyerPhone = this.orderForm.get('phone')?.value;
    const paymentMethod = this.orderForm.get('paymentMethod')?.value;
    const note = this.orderForm.get('note')?.value;
    const orderDetails = this.listCartItem.map((item) => {
      return {
        flowerListingId: item.flowerId,
        quantity: item.quantity,
        price: String(item.flowerPrice),
      };
    });

    if (paymentMethod === PaymentMethod.WALLET) {
      this.orderService
        .orderByWallet(
          buyerName,
          buyerAddress,
          buyerPhone,
          paymentMethod,
          note,
          orderDetails
        )
        .subscribe({
          next: (response: any) => {
            this.cartService.clearCart();
            this.cartService.totalAmountSubject.next(0);
            this.cartService.cartDataSource.next([]);
            this.cartService.totalQuantitySubject.next(0);
            this.orderForm.reset();
            this.statusOrder = 1;
          },
          error: (error: HttpErrorResponse) => {
            console.log(error);
            this.statusOrder = 2;
          },
        });
    } else if (paymentMethod === PaymentMethod.COD) {
      this.orderService
        .orderByCOD(
          buyerName,
          buyerAddress,
          buyerPhone,
          paymentMethod,
          note,
          orderDetails
        )
        .subscribe({
          next: (response: any) => {
            this.cartService.clearCart();
            this.cartService.totalAmountSubject.next(0);
            this.cartService.cartDataSource.next([]);
            this.cartService.totalQuantitySubject.next(0);
            this.orderForm.reset();
            this.statusOrder = 1;
          },
          error: (error: HttpErrorResponse) => {
            console.log(error);
            this.statusOrder = 2;
          },
        });
    }
  }
  checkBalance(): void {
    if (this.userAccount && this.totalAmount) {
      this.isBalanceInsufficient = this.userAccount.balance < this.totalAmount;
      this.isDisabledBtn = this.isBalanceInsufficient;
    }
  }

  retryOrder() {
    this.statusOrder = 0;
  }
}
