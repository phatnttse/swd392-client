import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { MatSelectModule } from '@angular/material/select';
import { Gender } from '../../models/enums';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from '../../layouts/header/header.component';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseResponse } from '../../models/base.model';
import { repeat } from 'rxjs';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule,
    MatSelectModule,
    MatIconModule,
    TranslateModule,
    HeaderComponent,
    FooterComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent {
  formSignUp: FormGroup;
  hidePassword = signal(true); // Ẩn hiện mật khẩu
  loadingBtn = signal(false); // Trạng thái nút đăng ký
  genders = Object.values(Gender);
  hideRepeatPassword = signal(true); // Ẩn hiện nhập lại mật khẩu

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService
  ) {
    this.formSignUp = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      name: ['', Validators.required],
      accountGender: ['', Validators.required],
      repeatPassword: ['', Validators.required],
    });
  }

  // Đăng ký tài khoản
  btnSignUp() {
    if (this.formSignUp.invalid) {
      this.formSignUp.markAllAsTouched();
      return;
    }
    if (
      this.formSignUp.get('password')?.value !==
      this.formSignUp.get('repeatPassword')?.value
    ) {
      this.toastr.warning('Enter repeat password mismatch', 'Warning', {
        progressBar: true,
      });
      return;
    }
    this.loadingBtn.set(true);

    const email = this.formSignUp.get('email')?.value;
    const password = this.formSignUp.get('password')?.value;
    const name = this.formSignUp.get('name')?.value;
    const accountGender = this.formSignUp.get('accountGender')?.value;

    this.authService
      .registerAccount(email, password, name, accountGender)
      .subscribe({
        next: (response: BaseResponse<string>) => {
          this.loadingBtn.set(false);
          if (response.code === 201) {
            this.router.navigate(['/signin']);
            this.toastr.info(response.message, 'Notification', {
              progressBar: true,
              timeOut: 6000,
            });
          }
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.loadingBtn.set(false);
          this.toastr.warning(
            errorResponse.error.error,
            errorResponse.error.message,
            {
              progressBar: true,
            }
          );
          console.error('Error during registration:', errorResponse);
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
  btnHidePassword(event: MouseEvent) {
    this.hidePassword.set(!this.hidePassword());
    event.stopPropagation();
  }

  // Ẩn hiện mật khẩu
  btnHideRepeatPassword(event: MouseEvent) {
    this.hideRepeatPassword.set(!this.hideRepeatPassword());
    event.stopPropagation();
  }
}
