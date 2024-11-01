import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../../services/account.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../../layouts/header/header.component';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

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
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  loadingBtn = signal(false);

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required]],
      repeatPassword: ['', Validators.required],
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
}
