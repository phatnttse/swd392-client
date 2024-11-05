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
import { CancelOrderReason, OrderDetailStatus } from '../../../models/enums';
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
  cancelOrderReasons = Object.values(CancelOrderReason); // Danh sách lý do hủy đơn hàng

  constructor(
    private formBuilder: FormBuilder,
    private orderService: OrderService,
    @Inject(MAT_DIALOG_DATA) public data: number,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<CancelOrderComponent>,
    private translate: TranslateService
  ) {
    this.formCancelOrder = this.formBuilder.group({
      reason: ['', [Validators.required]],
      otherReason: [{ value: '', disabled: true }],
    });

    // Theo dõi thay đổi của lý do hủy đơn hàng
    this.formCancelOrder.get('reason')?.valueChanges.subscribe((value) => {
      if (value === this.translate.instant(CancelOrderReason.Other)) {
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

    if (reason === CancelOrderReason.Other) {
      reason = this.formCancelOrder.get('otherReason')?.value;
    }

    const orderId = this.data;

    this.orderService
      .updateOrderStatus(orderId, reason, OrderDetailStatus.BUYER_CANCELED)
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
