import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
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
import {
  AddBalanceResponse,
  UserAccount,
  UserBalanceResponse,
} from '../../models/account.model';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../layouts/header/header.component';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { WalletService } from '../../services/wallet.service';
import { WalletLog, WalletLogResponse } from '../../models/wallet.model';
import { WalletLogStatus, WalletLogType } from '../../models/enums';
import { Utilities } from '../../services/utilities';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { BreadcrumbComponent } from '../../layouts/breadcrumb/breadcrumb.component';
import { Subscription } from 'rxjs';
import { StatusService } from '../../services/status.service';

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
    MatSelectModule,
    MatDatepickerModule,
    FormsModule,
    BreadcrumbComponent,
  ],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.scss',
})
export class WalletComponent implements OnInit, OnDestroy {
  formTopUp: FormGroup; // Form nạp tiền
  listWalletLog: WalletLog[] = []; // Danh sách lịch sử giao dịch
  walletLogTypes = Object.values(WalletLogType); // Danh sách loại giao dịch
  walletLogType = WalletLogType; // Loại giao dịch
  order: string = 'desc'; // Sắp xếp tăng dần hoặc giảm dần
  sortBy: string = 'createdAt'; // Sắp xếp theo trường nào
  startDate: Date = new Date(); // Lọc theo ngày bắt đầu
  endDate: Date = new Date(); // Lọc theo ngày kết thúc
  totalPages: number = 0; // Tổng số trang
  pageNumber: number = 0; // Số trang hiện tại
  pageSize: number = 10; // Số lượng trên mỗi trang
  totalElements: number = 0; // Tổng số lượng
  currentPage: number = 0; // Trang hiện tại
  visiblePages: number[] = []; // Các trang hiển thị
  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  }); // Thời gian lọc
  walletLogStatus = WalletLogStatus; // Trạng thái giao dịch
  walletLogStatuses = Object.values(WalletLogStatus); // Danh sách trạng thái giao dịch
  type: string = ''; // Loại giao dịch
  status: string = ''; // Trạng thái giao dịch
  userAccount: UserAccount | null = null; // Thông tin tài khoản người dùng
  userAccountSubscription: Subscription = new Subscription(); // Subscription của user account
  accountBalance: number = 0; // Số dư tài khoản

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private accountService: AccountService,
    public authService: AuthService,
    private walletService: WalletService,
    private statusService: StatusService
  ) {
    this.formTopUp = this.formBuilder.group({
      amount: ['', [Validators.required, Validators.min(20000)]],
    });
  }

  ngOnInit(): void {
    this.userAccountSubscription = this.authService.userDataSource.subscribe(
      (userAccount: UserAccount) => {
        this.userAccount = userAccount;
      }
    );
    this.getBalance();
    this.getWalletLogsByUser();
  }

  ngOnDestroy(): void {
    this.userAccountSubscription.unsubscribe();
  }

  getBalance() {
    this.accountService.getAccountBalance().subscribe({
      next: (response: UserBalanceResponse) => {
        this.accountBalance = response.balance;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error getting balance:', error);
      },
    });
  }

  // Nạp tiền vào ví
  btnTopUp() {
    if (this.formTopUp.invalid) {
      this.formTopUp.markAllAsTouched();
      return;
    }
    this.statusService.statusLoadingSpinnerSource.next(true);
    const amount = this.formTopUp.get('amount')?.value;

    this.accountService.addBalance(amount).subscribe({
      next: (response: AddBalanceResponse) => {
        window.location.href = response.checkoutUrl;
        this.formTopUp.reset();
        this.statusService.statusLoadingSpinnerSource.next(false);
      },
      error: (error: HttpErrorResponse) => {
        this.statusService.statusLoadingSpinnerSource.next(false);
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
    type: string = this.type,
    startDate?: string,
    endDate?: string
  ) {
    this.walletService
      .getWalletLogsByAccount(
        order,
        sortBy,
        pageNumber,
        pageSize,
        [status],
        type,
        startDate,
        endDate
      )
      .subscribe({
        next: (response: WalletLogResponse) => {
          if (response.success) {
            this.listWalletLog = response.data.content;
            this.totalPages = response.data.totalPages;
            this.totalElements = response.data.totalElements;
            this.visiblePages = Utilities.generateVisiblePageArray(
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
    this.visiblePages = Utilities.generateVisiblePageArray(
      this.currentPage,
      this.totalPages
    );
  }

  // Xử lý khi chọn ngày bắt đầu
  onStartDateChange(event: any): void {
    const startDate = event.value;
    const currentDate = new Date();
    if (startDate && startDate >= currentDate) {
      this.range.get('start')?.setValue(null); // Reset the start date
      this.toastr.warning(
        'Ngày bắt đầu không được lớn hơn ngày hiện tại',
        'Warning'
      );
    }
  }

  // Xử lý khi chọn ngày kết thúc
  onEndDateChange(event: any): void {
    const endDate = event.value;
    const currentDate = new Date();
    if (endDate && endDate >= currentDate) {
      this.range.get('end')?.setValue(null); // Reset the end date
      this.toastr.warning(
        'Ngày kết thúc không được lớn hơn ngày hiện tại',
        'Warning'
      );
    }
  }

  btnApplyFilter() {
    const startDate = Utilities.formatDate(
      this.range.get('start')?.value! ?? null
    );
    const endDate = Utilities.formatDate(this.range.get('end')?.value! ?? null);
    this.getWalletLogsByUser(
      this.order,
      this.sortBy,
      this.currentPage,
      this.pageSize,
      this.status,
      this.type,
      startDate,
      endDate
    );
  }
}
