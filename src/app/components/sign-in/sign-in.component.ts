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
import { FooterComponent } from '../../layouts/footer/footer.component';
import { HeaderComponent } from '../../layouts/header/header.component';
import { GetCartByUserResponse } from '../../models/cart.model';
import { CartService } from '../../services/cart.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    FooterComponent,
    HeaderComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignInComponent {
  formLogin: FormGroup; // Form đăng nhập
  hide = signal(true); // Ẩn hiện mật khẩu
  loadingBtn = signal(false); // Trạng thái nút đăng ký

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService,
    private cartService: CartService
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
    this.loadingBtn.set(true);

    const email = this.formLogin.get('email')?.value;
    const password = this.formLogin.get('password')?.value;

    this.authService.loginWithPassword(email, password).subscribe({
      next: (response) => {
        this.toastr.success(response.message, 'Success', { progressBar: true });
        this.getCartByUser();

        setTimeout(() => {
          this.authService.redirectLogin();
          this.loadingBtn.set(false);
        }, 400);
      },

      error: (error: HttpErrorResponse) => {
        this.loadingBtn.set(false);
        this.toastr.warning(error.error.message, error.error.error, {
          progressBar: true,
        });
        console.error('Error during login:', error);
      },
    });
  }

  // Lấy giỏ hàng ban đầu và phân phối dữ liệu
  getCartByUser() {
    this.cartService.getCartByUser().subscribe({
      next: (response: GetCartByUserResponse) => {
        if (response.code === 200 && response.data) {
          this.cartService.cartDataSource.next(response.data);
          this.cartService.updateTotalQuantity(response.data);
          this.cartService.updateTotalAmount(response.data);
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  // Ẩn hiện mật khẩu
  btnHidePassword(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
}
