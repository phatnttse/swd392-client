import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OrderService } from '../../../services/order.service';
import {
  BuyerCancelOrderReason,
  OrderDetailStatus,
  SellerCancelOrderReason,
} from '../../../models/enums';
import { UpdateOrderStatusResponse } from '../../../models/order.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cancel-order',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    TranslateModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './cancel-order.component.html',
  styleUrl: './cancel-order.component.scss',
})
export class CancelOrderComponent {
  formCancelOrder: FormGroup; // Form hủy đơn hàng
  buyerCancelOrderReasons = Object.values(BuyerCancelOrderReason); // Danh sách lý do hủy đơn hàng
  orderStatus: string = ''; // Trạng thái đơn hàng
  orderDetailStatus = OrderDetailStatus; // Trạng thái chi tiết đơn hàng
  sellerCancelOrderReasons = Object.values(SellerCancelOrderReason); // Danh sách lý do hủy đơn hàng của người bán

  constructor(
    private formBuilder: FormBuilder,
    private orderService: OrderService,
    @Inject(MAT_DIALOG_DATA)
    public data: { orderId: number; orderStatus: string },
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<CancelOrderComponent>,
    private translate: TranslateService
  ) {
    this.orderStatus = data.orderStatus;
    this.formCancelOrder = this.formBuilder.group({
      reason: ['', [Validators.required]],
      otherReason: [{ value: '', disabled: true }],
    });

    // Theo dõi thay đổi của lý do hủy đơn hàng
    this.formCancelOrder.get('reason')?.valueChanges.subscribe((value) => {
      if (value === this.translate.instant(BuyerCancelOrderReason.Other)) {
        this.formCancelOrder.get('otherReason')?.enable();
      } else {
        this.formCancelOrder.get('otherReason')?.disable();
      }
    });
  }

  btnCancelOrder() {
    if (this.formCancelOrder.invalid) {
      this.formCancelOrder.markAllAsTouched();
      return;
    }

    let reason = this.formCancelOrder.get('reason')?.value;

    if (reason === BuyerCancelOrderReason.Other) {
      reason = this.formCancelOrder.get('otherReason')?.value;
    }

    const orderId = this.data.orderId;
    const orderStatus = this.data.orderStatus;

    this.orderService
      .updateOrderStatus(orderId, reason, orderStatus)
      .subscribe({
        next: (response: UpdateOrderStatusResponse) => {
          if (response.success) {
            this.dialogRef.close(true);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.toastr.error(error.error.error, 'Error');
        },
      });
  }
}
