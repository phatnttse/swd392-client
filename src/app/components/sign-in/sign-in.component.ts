import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    TranslateModule,
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignInComponent {
  formLogin: FormGroup; // Form đăng nhập
  hide = signal(true); // Ẩn hiện mật khẩu

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService
  ) {
    this.formLogin = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
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

  // Đăng nhập bằng email và mật khẩu
  loginWithPassword() {
    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      return;
    }

    const email = this.formLogin.get('email')?.value;
    const password = this.formLogin.get('password')?.value;

    this.authService.loginWithPassword(email, password).subscribe({
      next: (response) => {
        this.router.navigate(['']);
        this.toastr.success(response.message, 'Success', { progressBar: true });
      },

      error: (error: HttpErrorResponse) => {
        this.toastr.warning(error.error.message, error.error.error, {
          progressBar: true,
        });
        console.error('Error during login:', error);
      },
    });
  }

  // Ẩn hiện mật khẩu
  btnHidePassword(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
}
