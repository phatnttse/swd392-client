import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../../layouts/header/header.component';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { StatusService } from '../../services/status.service';
import { MatIconModule } from '@angular/material/icon';
import { BaseResponse } from '../../models/base.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    HeaderComponent,
    FooterComponent,
    TranslateModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  loadingBtn = signal(false);
  token: string = '';
  hideNewPassword = signal(true); // Ẩn hiện mật khẩu mới
  hideRepeatPassword = signal(true); // Ẩn hiện mật khẩu lặp lại

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private statusService: StatusService,
    private router: Router
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required]],
      repeatPassword: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['token']) {
        this.token = params['token'];
      }
    });
  }

  btnResetPassword() {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    if (
      this.resetPasswordForm.value.newPassword !==
      this.resetPasswordForm.value.repeatPassword
    ) {
      this.toastr.error('Mật khẩu lặp lại không đúng');
      return;
    }

    if (!this.token) {
      this.toastr.error('Token không hợp lệ');
      return;
    }

    this.statusService.statusLoadingSpinnerSource.next(true);
    const newPassword = this.resetPasswordForm.value.newPassword;
    const repeatPassword = this.resetPasswordForm.value.repeatPassword;

    this.authService
      .resetPassword(this.token, newPassword, repeatPassword)
      .subscribe({
        next: (response: BaseResponse<any>) => {
          this.toastr.success('Đổi mật khẩu thành công');
          this.statusService.statusLoadingSpinnerSource.next(false);
          this.router.navigate(['/signin']);
        },
        error: (error: HttpErrorResponse) => {
          this.toastr.error(error.error.error, 'Đổi mật khẩu thất bại');
          this.statusService.statusLoadingSpinnerSource.next(false);
        },
      });
  }

  // Đăng nhập bằng Google
  async btnLoginGoogle() {
    this.authService
      .loginWithGoogle()
      .then((response) => {
        const user = response.user;
        user.getIdToken().then(async (token) => {
          console.log('Token:', token);
        });
      })
      .catch((error) => {
        console.error('Error during Google login:', error);
      });
  }

  // Ẩn hiện mật khẩu
  togglePasswordVisibility(field: 'new' | 'repeat') {
    if (field === 'new') {
      this.hideNewPassword.set(!this.hideNewPassword());
    } else if (field === 'repeat') {
      this.hideRepeatPassword.set(!this.hideRepeatPassword());
    }
  }
}
