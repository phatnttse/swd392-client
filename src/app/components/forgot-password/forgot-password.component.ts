import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [MatFormFieldModule, CommonModule, ReactiveFormsModule, RouterModule, MatLabel, MatButtonModule, MatInputModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  statusForgot = 0;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    const email = this.forgotPasswordForm.value.email;
    this.authService.forgotPassword(email).subscribe(
      response => {
        this.toastr.success('Mật khẩu mới đã được gửi đến email của bạn!');
      },
      error => {
        this.toastr.error('Có lỗi xảy ra. Vui lòng thử lại!')
      }
    )
  }
}
