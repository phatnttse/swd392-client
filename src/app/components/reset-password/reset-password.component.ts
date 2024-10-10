import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../../services/account.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, RouterModule, MatFormFieldModule, MatLabel, MatInputModule, MatButtonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private toastr: ToastrService
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required]],
      confirmPassword: ['',Validators.required]}
    );

  }

  onSubmit(){
    const password = this.resetPasswordForm.get('password')?.value;
    const confirmPassword = this.resetPasswordForm.get('confirmPassword')?.value;
    if (password != confirmPassword){
      this.toastr.error('Mật khẩu nhập lại phải trùng khớp với mật khẩu đã nhập!');
    }

    this.accountService.resetPassword(password, confirmPassword).subscribe(
      response =>{
        this.toastr.success('Mật khẩu mới đã được cập nhật!')
      },
      error =>{
        this.toastr.error('Có vấn đề khi cập nhật mật khẩu mới!')
      }
    );

  }
}
