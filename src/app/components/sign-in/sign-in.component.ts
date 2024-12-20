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
import { Notification } from '../../models/notification.model';
import { CartService } from '../../services/cart.service';
import { StatusService } from '../../services/status.service';
import { NotificationService } from '../../services/notification.service';
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
    private authService: AuthService,
    private cartService: CartService,
    private statusService: StatusService,
    private notificationService: NotificationService
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
    this.statusService.statusLoadingSpinnerSource.next(true);

    const email = this.formLogin.get('email')?.value;
    const password = this.formLogin.get('password')?.value;

    this.authService.loginWithPassword(email, password).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.getCartByUser();
          this.getAllNotifications();
          this.authService.redirectLogin();
          this.statusService.statusLoadingSpinnerSource.next(false);
          this.toastr.success(response.message, 'Success', {
            progressBar: true,
          });
        }, 800);
      },

      error: (error: HttpErrorResponse) => {
        this.statusService.statusLoadingSpinnerSource.next(false);
        this.toastr.warning(error.error.message, error.error.error, {
          progressBar: true,
        });
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

  // Lấy tất cả thông báo
  getAllNotifications() {
    this.notificationService
      .getAllNotifications(this.authService.currentUser?.id!, 5, '')
      .subscribe({
        next: (response: Notification[]) => {
          if (response.length) {
            const notifications = response.filter(
              (notification) => !notification.isRead && !notification.isDeleted
            );
            this.notificationService.notificationDataSource.next(notifications);
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
