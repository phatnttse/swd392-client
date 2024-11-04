import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../../services/account.service';
import { UserAccount, UserAccountResponse } from '../../models/account.model';
import { AuthService } from '../../services/auth.service';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { HeaderComponent } from '../../layouts/header/header.component';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { Gender } from '../../models/enums';
import { TranslateModule } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LocalStoreManager } from '../../services/local-storage.service';
import { DBkeys } from '../../services/db-keys';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { BreadcrumbComponent } from '../../layouts/breadcrumb/breadcrumb.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    RouterModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    HeaderComponent,
    FooterComponent,
    MatCardModule,
    MatTabsModule,
    MatCheckboxModule,
    MatChipsModule,
    MatListModule,
    MatToolbarModule,
    TranslateModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    BreadcrumbComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;

  profileForm: FormGroup; // Form thông tin tài khoản
  changePasswordForm: FormGroup; // Form đổi mật khẩu
  changeEmailForm: FormGroup; // Form đổi email
  verifyOTPForm: FormGroup; // Form xác nhận OTP
  userAccount: UserAccount | null = null; // Thông tin tài khoản người dùng
  genders = Object.values(Gender); // Danh sách giới tính
  statusPage: number = 0; // Trạng thái trang 0: overview, 1: change password, 2: change email
  hideCurrentPassword = signal(true); // Ẩn hiện mật khẩu hiện tại
  hideNewPassword = signal(true); // Ẩn hiện mật khẩu mới
  hideRepeatPassword = signal(true); // Ẩn hiện mật khẩu lặp lại
  loadingSaveBtn = signal(false); // Trạng thái nút lưu
  loadingUploadBtn = signal(false); // Trạng thái nút upload
  loadingChangeEmailBtn = signal(false); // Trạng thái nút đổi email
  loadingVerifyOTPBtn = signal(false); // Trạng thái nút xác nhận OTP
  selectedFile: File | null = null; // File ảnh đại diện
  isLinear = false; // Bước xác nhận email
  userAccountSubscription: Subscription = new Subscription(); // Subscription của user account

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private toastr: ToastrService,
    private authService: AuthService,
    private localStorage: LocalStoreManager,
    private router: Router,
    private cartService: CartService,
    private productService: ProductService
  ) {
    this.profileForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      gender: ['', Validators.required],
    });
    this.changePasswordForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      repeatPassword: ['', Validators.required],
    });
    this.changeEmailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.verifyOTPForm = this.formBuilder.group({
      otp: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.userAccountSubscription = this.authService.userDataSource.subscribe({
      next: (user: UserAccount) => {
        if (user) {
          this.userAccount = user;
          this.getAccountProfile();
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.userAccountSubscription.unsubscribe();
  }

  // Lấy thông tin tài khoản
  getAccountProfile() {
    if (this.userAccount) {
      this.profileForm.patchValue({
        name: this.userAccount.name,
        email: this.userAccount.email,
        phone: this.userAccount.phone,
        gender: this.userAccount.gender,
      });
    }
  }

  // Cập nhật thông tin tài khoản
  btnUpdateProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.loadingSaveBtn.set(true);
    const name = this.profileForm.get('name')?.value;
    const gender = this.profileForm.get('gender')?.value;
    const phone = this.profileForm.get('phone')?.value;

    this.accountService.updateProfile(name, phone, gender).subscribe({
      next: (response: UserAccountResponse) => {
        if (response.success) {
          this.localStorage.deleteData(DBkeys.CURRENT_USER);
          this.localStorage.savePermanentData(
            response.data,
            DBkeys.CURRENT_USER
          );
          this.authService.userDataSource.next(response.data);
          this.toastr.success(response.message, 'Success', {
            progressBar: true,
          });
          this.loadingSaveBtn.set(false);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.loadingSaveBtn.set(false);
        this.toastr.warning(error.error.message, 'Error', {
          progressBar: true,
        });
      },
    });
  }

  // Đổi mật khẩu
  btnChangePassword() {
    debugger;
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }
    if (
      this.changePasswordForm.get('newPassword')?.value.trim() !==
      this.changePasswordForm.get('repeatPassword')?.value.trim()
    ) {
      this.toastr.warning('Enter repeat password mismatch', 'Error');
      return;
    }

    this.loadingSaveBtn.set(true);
    const oldPassword = this.changePasswordForm.get('currentPassword')?.value;
    const newPassword = this.changePasswordForm.get('newPassword')?.value;
    const repeatPassword = this.changePasswordForm.get('repeatPassword')?.value;

    this.accountService
      .changePassword(oldPassword, newPassword, repeatPassword)
      .subscribe({
        next: (response: any) => {
          this.loadingSaveBtn.set(false);
          this.toastr.success(
            'Password has been changed successfully. Please log in again',
            'Success',
            {
              progressBar: true,
            }
          );
          this.changePasswordForm.reset();
          this.btnLogOut();
        },
        error: (error: HttpErrorResponse) => {
          this.loadingSaveBtn.set(false);
          this.toastr.warning(error.error.error, 'Error', {
            progressBar: true,
          });
        },
      });
  }

  // Đổi email
  btnChangeEmail() {
    if (this.changeEmailForm.invalid) {
      this.changeEmailForm.markAllAsTouched();
      return;
    }
    this.loadingChangeEmailBtn.set(true);
    const email = this.changeEmailForm.get('email')?.value;
    this.accountService.changeEmail(email).subscribe({
      next: (response: UserAccountResponse) => {
        this.toastr.success(response.message, 'Success', {
          progressBar: true,
        });
        this.loadingChangeEmailBtn.set(false);
        this.stepper.next();
      },
      error: (error: HttpErrorResponse) => {
        this.toastr.error(error.error.message, 'Error', {
          progressBar: true,
        });
        this.loadingChangeEmailBtn.set(false);
      },
    });
  }

  // Xác nhận OTP
  btnVerifyOTP() {
    if (this.verifyOTPForm.invalid) {
      this.verifyOTPForm.markAllAsTouched();
      return;
    }
    const otp = this.verifyOTPForm.get('otp')?.value;
    this.loadingVerifyOTPBtn.set(true);
    this.accountService.confirmChangeEmail(otp).subscribe({
      next: (response: UserAccountResponse) => {
        if (response.success) {
          this.authService.userDataSource.next(response.data);
          this.loadingVerifyOTPBtn.set(false);
          this.toastr.success(
            'Change Email Successful, Please login again',
            'Success',
            {
              progressBar: true,
            }
          );
          this.stepper.next();
          setTimeout(() => {
            this.btnLogOut();
          }, 2000);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.toastr.warning(error.error.message, 'Error', {
          progressBar: true,
        });
        this.loadingVerifyOTPBtn.set(false);
      },
    });
  }

  // Chọn file ảnh
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadAvatar();
      this.loadingUploadBtn.set(true);
    }
  }

  // Upload ảnh đại diện
  uploadAvatar() {
    this.accountService.uploadAvatar(this.selectedFile!).subscribe({
      next: (response: UserAccountResponse) => {
        if (response.success) {
          this.localStorage.deleteData(DBkeys.CURRENT_USER);
          this.localStorage.savePermanentData(
            response.data,
            DBkeys.CURRENT_USER
          );
          if (this.userAccount) {
            this.userAccount.avatar = response.data.avatar ?? '';
            this.authService.userDataSource.next(this.userAccount);
            this.toastr.success(response.message, 'Success', {
              progressBar: true,
            });
            this.loadingUploadBtn.set(false);
          }
        }
      },
      error: (error: HttpErrorResponse) => {
        this.toastr.warning(error.error.message, 'Error', {
          progressBar: true,
        });
      },
    });
  }

  // Chuyển trang
  btnChangeStatusPage(status: number) {
    this.statusPage = status;
  }

  // Ẩn hiện mật khẩu
  togglePasswordVisibility(field: 'current' | 'new' | 'repeat') {
    if (field === 'current') {
      this.hideCurrentPassword.set(!this.hideCurrentPassword());
    } else if (field === 'new') {
      this.hideNewPassword.set(!this.hideNewPassword());
    } else if (field === 'repeat') {
      this.hideRepeatPassword.set(!this.hideRepeatPassword());
    }
  }

  // Đăng xuất
  btnLogOut() {
    this.authService.logout();
    this.cartService.reset();
    this.productService.reset();
    this.router.navigate(['/signin']);
  }
}
