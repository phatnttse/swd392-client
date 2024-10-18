import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../../services/account.service';
import { AddBalanceResponse } from '../../models/account.model';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../layouts/header/header.component';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { WalletService } from '../../services/wallet.service';
import { WalletLog, WalletLogResponse } from '../../models/wallet.model';
import { WalletLogType } from '../../models/enums';
import { DBkeys } from '../../services/db-keys';
import { LocalStoreManager } from '../../services/local-storage.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatIconModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    HeaderComponent,
    FooterComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.scss',
})
export class WalletComponent implements OnInit {
  formTopUp: FormGroup; // Form nạp tiền
  listWalletLog: WalletLog[] = [];
  walletLogTypes = Object.values(WalletLogType);
  walletLogType = WalletLogType;
  order: string = 'desc'; // Sắp xếp tăng dần hoặc giảm dần
  sortBy: string = 'createdAt'; // Sắp xếp theo trường nào
  status: string = ''; // Lọc theo trạng thái
  type: string = ''; // Lọc theo loại
  startDate: Date = new Date(); // Lọc theo ngày bắt đầu
  endDate: Date = new Date(); // Lọc theo ngày kết thúc
  totalPages: number = 0; // Tổng số trang
  pageNumber: number = 0; // Số trang hiện tại
  pageSize: number = 6; // Số lượng sản phẩm trên mỗi trang
  totalElements: number = 0; // Tổng số lượng sản phẩm
  currentPage: number = 0; // Trang hiện tại
  visiblePages: number[] = []; // Các trang hiển thị
  loadingBtn = signal(false); // Trạng thái nút đăng ký

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private accountService: AccountService,
    public authService: AuthService,
    private walletService: WalletService,
    private localStorage: LocalStoreManager
  ) {
    this.formTopUp = this.formBuilder.group({
      amount: ['', [Validators.required, Validators.min(20000)]],
    });
  }

  ngOnInit(): void {
    this.getWalletLogsByUser();
  }

  // Nạp tiền vào ví
  btnTopUp() {
    if (this.formTopUp.invalid) {
      this.formTopUp.markAllAsTouched();
      return;
    }
    this.loadingBtn.set(true);
    const amount = this.formTopUp.get('amount')?.value;

    this.accountService.addBalance(amount).subscribe({
      next: (response: AddBalanceResponse) => {
        window.location.href = response.checkoutUrl;
        this.loadingBtn.set(false);
        this.formTopUp.reset();
      },
      error: (error: HttpErrorResponse) => {
        this.toastr.error(error.error.message, 'Error');
      },
    });
  }

  // Lấy lịch sử giao dịch của người dùng
  getWalletLogsByUser(
    order: string = this.order,
    sortBy: string = this.sortBy,
    pageNumber: number = this.pageNumber,
    pageSize: number = this.pageSize,
    status: string = this.status,
    type: string = this.type
  ) {
    this.walletService
      .getWalletLogsByAccount(
        order,
        sortBy,
        pageNumber,
        pageSize,
        [status],
        type
      )
      .subscribe({
        next: (response: WalletLogResponse) => {
          if (response.success) {
            this.listWalletLog = response.data.content;
            this.totalPages = response.data.totalPages;
            this.totalElements = response.data.totalElements;
            this.visiblePages = this.generateVisiblePageArray(
              this.currentPage,
              this.totalPages
            );
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        },
      });
  }

  // Lấy tên loại giao dịch
  getWalletLogTypeLabel(type: WalletLogType): string {
    switch (type) {
      case WalletLogType.ADD:
        return 'Wallet.Add';
      case WalletLogType.SUBTRACT:
        return 'Wallet.Subtract';
      case WalletLogType.DEPOSIT:
        return 'Wallet.Deposit';
      case WalletLogType.WITHDRAW:
        return 'Wallet.Withdraw';
      default:
        return 'Wallet.Unknown';
    }
  }

  // Xử lý khi thay đổi trang
  onPageChange(page: number) {
    this.currentPage = page < 0 ? 0 : page;
    this.getWalletLogsByUser(
      this.order,
      this.sortBy,
      this.currentPage,
      this.pageSize,
      this.status,
      this.type
    );
    this.visiblePages = this.generateVisiblePageArray(
      this.currentPage,
      this.totalPages
    );
  }

  // Tạo mảng các trang hiển thị
  generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisiblePages + 1, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    return new Array(endPage - startPage + 1)
      .fill(0)
      .map((_, index) => startPage + index);
  }
}
