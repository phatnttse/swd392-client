import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaymentStatus } from '../../../models/enums';
import { ToastrService } from 'ngx-toastr';
import {
  UserAccount,
  UserBalanceResponse,
} from '../../../models/account.model';
import { AccountService } from '../../../services/account.service';
import { DBkeys } from '../../../services/db-keys';
import { LocalStoreManager } from '../../../services/local-storage.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import confetti from 'canvas-confetti';
import { WalletService } from '../../../services/wallet.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { PaymentDetails } from '../../../models/payment.model';

@Component({
  selector: 'app-add-balance',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './add-balance.component.html',
  styleUrl: './add-balance.component.scss',
})
export class AddBalanceComponent implements OnInit, OnDestroy {
  userAccount: UserAccount | null = null; // Thông tin tài khoản người dùng
  statusPage: number = 0; // 0: xử lý thanh toán, 1: thanh toán thành công, 2: thanh toán thất bại
  userAccountSubscription: Subscription = new Subscription(); // Subscription của user account
  paymentDetails: PaymentDetails | null = null; // Thông tin thanh toán

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private accountService: AccountService,
    private localStorage: LocalStoreManager,
    private walletService: WalletService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (
        params['id'] &&
        params['status'] &&
        params['orderCode'] &&
        params['cancel']
      ) {
        this.handlePaymentCallback();
      }
    });
    this.userAccountSubscription = this.authService.userDataSource.subscribe(
      (userAccount: UserAccount) => {
        this.userAccount = userAccount;
      }
    );
  }

  ngOnDestroy(): void {
    this.userAccountSubscription.unsubscribe();
  }

  // Hàm hiệu ứng confetti
  startConfetti() {
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }

  // Hàm xử lý callback sau khi thanh toán
  private handlePaymentCallback() {
    this.route.queryParams.subscribe((params) => {
      const status = params['status'];
      const orderCode = params['orderCode'];
      const cancel = params['cancel'] === 'true';

      if (status) {
        if (status === PaymentStatus.PAID && !cancel) {
          this.getPaymentDetails(orderCode);
          this.updateUserBalance();
          this.statusPage = 1;
          this.startConfetti();
        } else if (status === PaymentStatus.CANCELLED || cancel) {
          this.statusPage = 2;
          this.getPaymentDetails(orderCode);
        } else {
          this.toastr.error(
            'Có lỗi xảy ra trong quá trình thanh toán.',
            'Error'
          );
        }
      }
    });
  }

  // Lấy thông tin thanh toán
  getPaymentDetails(orderCode: string) {
    this.walletService.getPaymentDetails(orderCode).subscribe({
      next: (response: PaymentDetails) => {
        this.paymentDetails = response;
      },
      error: (error) => {
        console.error('Lỗi khi lấy thông tin thanh toán:', error);
      },
    });
  }

  // Cập nhật số dư người dùng sau khi thanh toán thành công
  private updateUserBalance() {
    this.accountService.getAccountBalance().subscribe({
      next: (response: UserBalanceResponse) => {
        if (this.userAccount) {
          this.userAccount.balance = response.balance;
          this.localStorage.savePermanentData(
            this.userAccount,
            DBkeys.CURRENT_USER
          );
          this.authService.userDataSource.next(this.userAccount);
        }
      },
      error: (error) => {
        console.error('Lỗi khi lấy số dư:', error);
      },
    });
  }
}
