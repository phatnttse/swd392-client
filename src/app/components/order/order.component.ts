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
  ],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss',
})
export class OrderComponent implements OnInit {
  orderForm: FormGroup;
  listCartItem: CartItem[] = [];
  totalAmount: number = 0;
  selectedPaymentMethod: string = '';
  statusOrder: number = 0; // 0: Chưa đặt hàng, 1: Đặt hàng thành công, 2: Đặt hàng thất bại

  constructor(
    private formBuilder: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService
  ) {
    this.orderForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
        ],
      ],
      deliveryAddress: ['', [Validators.required, Validators.minLength(10)]],
      paymentMethod: ['', Validators.required],
      note: ['', Validators.maxLength(200)],
    });
  }

  ngOnInit(): void {
    this.cartService.cartDataSource.subscribe((cartData: CartItem[]) => {
      if (cartData) {
        this.listCartItem = cartData;
      }
    });
    this.cartService.totalAmountSubject.subscribe(
      (totalAmount: number) => (this.totalAmount = totalAmount)
    );
  }
  placeOrder() {
    debugger;
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
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
        price: item.flowerPrice,
      };
    });

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
          this.statusOrder = 1;
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
          this.statusOrder = 2;
        },
      });
  }
  retryOrder() {
    this.statusOrder = 0;
  }
}
